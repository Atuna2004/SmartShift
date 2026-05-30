import crypto from "crypto";
import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { AttendanceModel } from "../attendance/attendance.model.js";
import type { IAttendance } from "../attendance/attendance.model.js";
import { OrganizationModel } from "../organization/organization.model.js";
import { ScheduleModel } from "../schedule/schedule.model.js";
import {
  SubscriptionModel,
  SubscriptionPlanModel,
} from "../subscription/subscription.model.js";
import type { ISubscriptionPlan } from "../subscription/subscription.model.js";
import { UserModel } from "../user/user.model.js";
import type { IUser } from "../user/user.model.js";
import { PaymentModel } from "./payment.model.js";
import type { IPayment, PaymentMethod, PaymentProvider } from "./payment.model.js";
import type {
  CalculatePayrollInput,
  CreatePayrollPaymentInput,
  CreateSubscriptionPaymentInput,
  MarkPaymentPaidInput,
  PaymentListQuery,
} from "./payment.validation.js";

const PAYOS_API_URL = "https://api-merchant.payos.vn/v2/payment-requests";
const DEFAULT_HOURLY_RATE = Number(process.env.PAYROLL_DEFAULT_HOURLY_RATE ?? 25000);

const getDocumentId = (document: { _id: unknown }) => document._id as Types.ObjectId;

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const ensureActor = async (actor: AuthTokenPayload) => {
  if (!actor.userId) {
    throw new AppError(401, "You are not authorized");
  }

  const user = await UserModel.findById(actor.userId);

  if (!user) {
    throw new AppError(401, "Authenticated user no longer exists");
  }

  if (user.status !== "active") {
    throw new AppError(403, "User account is inactive");
  }

  if (!["admin", "owner"].includes(user.role)) {
    throw new AppError(403, "Only owners or admins can manage payments");
  }

  return user;
};

const getOrganizationForOwner = async (owner: IUser, organizationId?: string) => {
  const resolvedOrganizationId = organizationId
    ? new Types.ObjectId(organizationId)
    : owner.organizationId;

  if (!resolvedOrganizationId) {
    throw new AppError(400, "Organization is required");
  }

  const organization = await OrganizationModel.findById(resolvedOrganizationId);

  if (!organization) {
    throw new AppError(404, "Organization not found");
  }

  if (owner.role === "admin") {
    return organization;
  }

  const ownsOrganization = organization.ownerId.equals(getDocumentId(owner));
  const sameOrganization =
    owner.organizationId && owner.organizationId.equals(getDocumentId(organization));

  if (!ownsOrganization && !sameOrganization) {
    throw new AppError(403, "Organization is outside your scope");
  }

  return organization;
};

const getActivePlan = async (planId: string) => {
  const plan = await SubscriptionPlanModel.findById(planId);

  if (!plan || plan.deletedAt) {
    throw new AppError(404, "Subscription plan not found");
  }

  if (plan.status !== "active") {
    throw new AppError(400, "Subscription plan is disabled");
  }

  return plan;
};

const buildOrderCode = () => Number(`${Date.now()}${Math.floor(Math.random() * 90 + 10)}`);

const getPaymentProvider = (paymentMethod: PaymentMethod): PaymentProvider =>
  paymentMethod === "payos" ? "payos" : "manual";

const toPublicPayment = (payment: IPayment) => ({
  id: getDocumentId(payment).toString(),
  purpose: payment.purpose,
  provider: payment.provider,
  paymentMethod: payment.paymentMethod,
  paymentStatus: payment.paymentStatus,
  organizationId: payment.organizationId.toString(),
  ownerId: payment.ownerId.toString(),
  amount: payment.amount,
  currency: payment.currency,
  orderCode: payment.orderCode,
  ...(payment.branchId ? { branchId: payment.branchId.toString() } : {}),
  ...(payment.subscriptionId
    ? { subscriptionId: payment.subscriptionId.toString() }
    : {}),
  ...(payment.employeeId ? { employeeId: payment.employeeId.toString() } : {}),
  ...(payment.months ? { months: payment.months } : {}),
  ...(payment.transactionCode ? { transactionCode: payment.transactionCode } : {}),
  ...(payment.checkoutUrl ? { checkoutUrl: payment.checkoutUrl } : {}),
  ...(payment.payosPaymentLinkId
    ? { payosPaymentLinkId: payment.payosPaymentLinkId }
    : {}),
  ...(payment.payrollPeriodStart
    ? { payrollPeriodStart: payment.payrollPeriodStart }
    : {}),
  ...(payment.payrollPeriodEnd ? { payrollPeriodEnd: payment.payrollPeriodEnd } : {}),
  ...(payment.payrollMeta ? { payrollMeta: payment.payrollMeta } : {}),
  ...(payment.paidAt ? { paidAt: payment.paidAt } : {}),
  ...(payment.cancelledAt ? { cancelledAt: payment.cancelledAt } : {}),
  ...(payment.refundedAt ? { refundedAt: payment.refundedAt } : {}),
  ...(payment.failedAt ? { failedAt: payment.failedAt } : {}),
  ...(payment.note ? { note: payment.note } : {}),
});

const buildPayosSignature = (data: Record<string, unknown>) => {
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!checksumKey) {
    throw new AppError(500, "PAYOS_CHECKSUM_KEY is not configured");
  }

  const rawData = Object.keys(data)
    .sort()
    .filter((key) => data[key] !== undefined && key !== "signature")
    .map((key) => `${key}=${data[key]}`)
    .join("&");

  return crypto.createHmac("sha256", checksumKey).update(rawData).digest("hex");
};

const createPayosLink = async (payment: IPayment, description: string) => {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const returnUrl = process.env.PAYOS_RETURN_URL;
  const cancelUrl = process.env.PAYOS_CANCEL_URL;

  if (!clientId || !apiKey || !returnUrl || !cancelUrl) {
    throw new AppError(500, "PayOS environment is not configured");
  }

  const payload = {
    orderCode: payment.orderCode,
    amount: payment.amount,
    description: description.slice(0, 25),
    returnUrl,
    cancelUrl,
  };
  const signature = buildPayosSignature(payload);
  const response = await fetch(PAYOS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": clientId,
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ ...payload, signature }),
  });
  const result = (await response.json()) as {
    code?: string;
    desc?: string;
    data?: {
      checkoutUrl?: string;
      paymentLinkId?: string;
    };
  };

  if (!response.ok || result.code !== "00" || !result.data?.checkoutUrl) {
    throw new AppError(502, result.desc || "Unable to create PayOS payment link");
  }

  payment.checkoutUrl = result.data.checkoutUrl;
  if (result.data.paymentLinkId) {
    payment.payosPaymentLinkId = result.data.paymentLinkId;
  }
  await payment.save();
};

const snapshotPlan = (plan: ISubscriptionPlan) => ({
  planId: getDocumentId(plan),
  planCode: plan.code,
  planName: plan.name,
  priceMonthly: plan.priceMonthly,
  currency: plan.currency,
  limits: plan.limits,
  features: plan.features,
});

const createSubscriptionPayment = async (
  actorPayload: AuthTokenPayload,
  payload: CreateSubscriptionPaymentInput
) => {
  const owner = await ensureActor(actorPayload);
  const organization = await getOrganizationForOwner(owner, payload.organizationId);
  const plan = await getActivePlan(payload.planId);
  const startDate = new Date();
  const endDate = addMonths(startDate, payload.months);
  const amount = plan.priceMonthly * payload.months;

  await SubscriptionModel.updateMany(
    {
      organizationId: getDocumentId(organization),
      status: { $in: ["pending", "active"] },
    },
    {
      $set: {
        status: "cancelled",
        cancelledAt: new Date(),
        updatedBy: getDocumentId(owner),
      },
    }
  );

  const subscription = await SubscriptionModel.create({
    organizationId: getDocumentId(organization),
    ownerId: getDocumentId(owner),
    ...snapshotPlan(plan),
    startDate,
    endDate,
    status: "pending",
    autoRenew: false,
    createdBy: getDocumentId(owner),
  });

  const payment = await PaymentModel.create({
    purpose: "subscription",
    provider: getPaymentProvider(payload.paymentMethod),
    paymentMethod: payload.paymentMethod,
    paymentStatus: "pending",
    organizationId: getDocumentId(organization),
    ownerId: getDocumentId(owner),
    subscriptionId: getDocumentId(subscription),
    amount,
    currency: plan.currency,
    months: payload.months,
    orderCode: buildOrderCode(),
    createdBy: getDocumentId(owner),
    ...(payload.note ? { note: payload.note } : {}),
  });

  if (payload.paymentMethod === "payos") {
    await createPayosLink(payment, `SmartShift ${plan.code}`);
  }

  return {
    subscriptionId: getDocumentId(subscription).toString(),
    payment: toPublicPayment(payment),
  };
};

const minutesBetween = (from?: Date, to?: Date) => {
  if (!from || !to || to <= from) {
    return 0;
  }

  return Math.round((to.getTime() - from.getTime()) / 60000);
};

const calculatePayrollFromAttendances = (
  attendances: IAttendance[],
  hourlyRate: number,
  overtimeMultiplier: number,
  deductionRatePerMinute: number
) => {
  const workedMinutes = attendances.reduce(
    (total, attendance) =>
      total + minutesBetween(attendance.checkInTime, attendance.checkOutTime),
    0
  );
  const overtimeMinutes = attendances.reduce(
    (total, attendance) => total + (attendance.overtimeMinutes ?? 0),
    0
  );
  const lateMinutes = attendances.reduce(
    (total, attendance) => total + (attendance.lateMinutes ?? 0),
    0
  );
  const workedHours = workedMinutes / 60;
  const overtimeHours = overtimeMinutes / 60;
  const basePay = workedHours * hourlyRate;
  const overtimePay = overtimeHours * hourlyRate * overtimeMultiplier;
  const deductions = lateMinutes * deductionRatePerMinute;
  const netAmount = Math.max(basePay + overtimePay - deductions, 0);

  return {
    hourlyRate,
    workedHours,
    overtimeHours,
    lateMinutes,
    overtimeMultiplier,
    deductionRatePerMinute,
    basePay,
    overtimePay,
    deductions,
    attendanceCount: attendances.length,
    netAmount,
  };
};

const getPayrollContext = async (
  owner: IUser,
  payload: CalculatePayrollInput | CreatePayrollPaymentInput
) => {
  const organization = await getOrganizationForOwner(owner, payload.organizationId);
  const employee = await UserModel.findById(payload.employeeId);

  if (!employee) {
    throw new AppError(404, "Employee not found");
  }

  if (
    !employee.organizationId ||
    !employee.organizationId.equals(getDocumentId(organization))
  ) {
    throw new AppError(403, "Employee is outside your organization");
  }

  if (payload.from > payload.to) {
    throw new AppError(400, "from must be before or equal to to");
  }

  const attendances = await AttendanceModel.find({
    organizationId: getDocumentId(organization),
    employeeId: getDocumentId(employee),
    workDate: { $gte: payload.from, $lte: payload.to },
    checkInTime: { $exists: true },
    checkOutTime: { $exists: true },
  }).sort({ workDate: 1 });

  const employeeHourlyRate = Number(
    (employee as unknown as { hourlyRate?: number }).hourlyRate
  );
  const hourlyRate =
    payload.hourlyRate ??
    (Number.isFinite(employeeHourlyRate) && employeeHourlyRate > 0
      ? employeeHourlyRate
      : DEFAULT_HOURLY_RATE);
  const payroll = calculatePayrollFromAttendances(
    attendances,
    hourlyRate,
    payload.overtimeMultiplier,
    payload.deductionRatePerMinute
  );

  return {
    organization,
    employee,
    payroll,
  };
};

const calculatePayroll = async (
  actorPayload: AuthTokenPayload,
  payload: CalculatePayrollInput
) => {
  const owner = await ensureActor(actorPayload);
  const { organization, employee, payroll } = await getPayrollContext(owner, payload);

  return {
    organizationId: getDocumentId(organization).toString(),
    employeeId: getDocumentId(employee).toString(),
    period: {
      from: payload.from,
      to: payload.to,
    },
    payroll,
  };
};

const createPayrollPayment = async (
  actorPayload: AuthTokenPayload,
  payload: CreatePayrollPaymentInput
) => {
  const owner = await ensureActor(actorPayload);
  const { organization, employee, payroll } = await getPayrollContext(owner, payload);
  const amount = Math.round(payroll.netAmount);

  const payment = await PaymentModel.create({
    purpose: "payroll",
    provider: getPaymentProvider(payload.paymentMethod),
    paymentMethod: payload.paymentMethod,
    paymentStatus: "pending",
    organizationId: getDocumentId(organization),
    ownerId: getDocumentId(owner),
    employeeId: getDocumentId(employee),
    amount,
    currency: "VND",
    orderCode: buildOrderCode(),
    payrollPeriodStart: payload.from,
    payrollPeriodEnd: payload.to,
    payrollMeta: {
      hourlyRate: payroll.hourlyRate,
      workedHours: payroll.workedHours,
      overtimeHours: payroll.overtimeHours,
      lateMinutes: payroll.lateMinutes,
      overtimeMultiplier: payroll.overtimeMultiplier,
      deductionRatePerMinute: payroll.deductionRatePerMinute,
      basePay: payroll.basePay,
      overtimePay: payroll.overtimePay,
      deductions: payroll.deductions,
      attendanceCount: payroll.attendanceCount,
    },
    createdBy: getDocumentId(owner),
    ...(payload.note ? { note: payload.note } : {}),
  });

  if (payload.paymentMethod === "payos") {
    await createPayosLink(payment, "SmartShift payroll");
  }

  return toPublicPayment(payment);
};

const activateSubscriptionForPayment = async (payment: IPayment) => {
  if (!payment.subscriptionId) {
    return;
  }

  const subscription = await SubscriptionModel.findById(payment.subscriptionId);

  if (!subscription) {
    throw new AppError(404, "Subscription not found");
  }

  subscription.status = "active";
  if (payment.updatedBy) {
    subscription.updatedBy = payment.updatedBy;
  }
  await subscription.save();

  const organization = await OrganizationModel.findById(subscription.organizationId);

  if (organization) {
    organization.subscriptionId = getDocumentId(subscription);
    await organization.save();
  }
};

const markPaymentPaidByDocument = async (
  payment: IPayment,
  actorId?: Types.ObjectId,
  payload: MarkPaymentPaidInput = {}
) => {
  if (payment.paymentStatus === "paid") {
    return payment;
  }

  if (!["pending", "failed"].includes(payment.paymentStatus)) {
    throw new AppError(400, "Payment cannot be marked as paid");
  }

  payment.paymentStatus = "paid";
  payment.paidAt = new Date();
  if (payload.transactionCode !== undefined) {
    payment.transactionCode = payload.transactionCode;
  }
  if (payload.note !== undefined) {
    payment.note = payload.note;
  }
  if (actorId) {
    payment.updatedBy = actorId;
  }
  await payment.save();

  await activateSubscriptionForPayment(payment);

  return payment;
};

const markPaymentPaid = async (
  actorPayload: AuthTokenPayload,
  paymentId: string,
  payload: MarkPaymentPaidInput
) => {
  const owner = await ensureActor(actorPayload);
  const payment = await PaymentModel.findById(paymentId);

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  await getOrganizationForOwner(owner, payment.organizationId.toString());

  const result = await markPaymentPaidByDocument(payment, getDocumentId(owner), payload);

  return toPublicPayment(result);
};

const setPaymentStatus = async (
  actorPayload: AuthTokenPayload,
  paymentId: string,
  status: "cancelled" | "refunded"
) => {
  const owner = await ensureActor(actorPayload);
  const payment = await PaymentModel.findById(paymentId);

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  await getOrganizationForOwner(owner, payment.organizationId.toString());

  payment.paymentStatus = status;
  payment.updatedBy = getDocumentId(owner);
  if (status === "cancelled") {
    payment.cancelledAt = new Date();
  } else {
    payment.refundedAt = new Date();
  }
  await payment.save();

  return toPublicPayment(payment);
};

const getPaymentList = async (
  actorPayload: AuthTokenPayload,
  query: PaymentListQuery
) => {
  const owner = await ensureActor(actorPayload);
  const organization = await getOrganizationForOwner(owner, query.organizationId);
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {
    organizationId: getDocumentId(organization),
  };

  if (query.purpose) filter.purpose = query.purpose;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;

  const [payments, total] = await Promise.all([
    PaymentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    PaymentModel.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: payments.map(toPublicPayment),
  };
};

const getPaymentById = async (actorPayload: AuthTokenPayload, paymentId: string) => {
  const owner = await ensureActor(actorPayload);
  const payment = await PaymentModel.findById(paymentId);

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  await getOrganizationForOwner(owner, payment.organizationId.toString());

  return toPublicPayment(payment);
};

const verifyPayosWebhook = (body: Record<string, unknown>) => {
  const signature = body.signature;

  if (typeof signature !== "string") {
    throw new AppError(400, "PayOS signature is missing");
  }

  const data = body.data;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new AppError(400, "PayOS webhook data is invalid");
  }

  const expectedSignature = buildPayosSignature(data as Record<string, unknown>);

  if (signature !== expectedSignature) {
    throw new AppError(400, "Invalid PayOS signature");
  }

  return data as Record<string, unknown>;
};

const handlePayosWebhook = async (body: Record<string, unknown>) => {
  const data = verifyPayosWebhook(body);
  const orderCode = Number(data.orderCode);

  if (!Number.isFinite(orderCode)) {
    throw new AppError(400, "PayOS order code is invalid");
  }

  const payment = await PaymentModel.findOne({ orderCode });

  if (!payment) {
    throw new AppError(404, "Payment not found");
  }

  const code = String(data.code ?? "");

  if (code === "00") {
    const result = await markPaymentPaidByDocument(payment, undefined, {
      transactionCode: String(data.reference ?? data.transactionCode ?? orderCode),
    });

    return toPublicPayment(result);
  }

  payment.paymentStatus = "failed";
  payment.failedAt = new Date();
  await payment.save();

  return toPublicPayment(payment);
};

export const PaymentService = {
  createSubscriptionPayment,
  calculatePayroll,
  createPayrollPayment,
  markPaymentPaid,
  cancelPayment: (actor: AuthTokenPayload, paymentId: string) =>
    setPaymentStatus(actor, paymentId, "cancelled"),
  refundPayment: (actor: AuthTokenPayload, paymentId: string) =>
    setPaymentStatus(actor, paymentId, "refunded"),
  getPaymentList,
  getPaymentById,
  handlePayosWebhook,
};
