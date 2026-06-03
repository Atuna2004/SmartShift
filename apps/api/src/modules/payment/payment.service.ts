import crypto from "crypto";
import mongoose, { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import { hashPassword } from "../../common/utils/hash.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { createRefreshToken, createToken } from "../../common/utils/jwt.js";
import { AttendanceModel } from "../attendance/attendance.model.js";
import type { IAttendance } from "../attendance/attendance.model.js";
import { BranchModel } from "../branch/branch.model.js";
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
import { RegistrationIntentModel } from "./registration-intent.model.js";
import type {
  CalculatePayrollInput,
  CompleteRegistrationInput,
  CreateRegistrationCheckoutInput,
  CreatePayrollPaymentInput,
  CreateSubscriptionPaymentInput,
  MarkPaymentPaidInput,
  PaymentListQuery,
} from "./payment.validation.js";

const PAYOS_API_URL = "https://api-merchant.payos.vn/v2/payment-requests";
const DEFAULT_HOURLY_RATE = Number(process.env.PAYROLL_DEFAULT_HOURLY_RATE ?? 25000);
const DEFAULT_VIETQR_TEMPLATE = "compact2";
const REGISTRATION_CHECKOUT_TTL_MINUTES = Number(
  process.env.REGISTRATION_CHECKOUT_TTL_MINUTES ?? 60
);

const DEFAULT_REGISTRATION_PLANS = {
  basic_49k: {
    name: "Gói 49k",
    code: "basic_49k",
    description: "1 chi nhánh, tối đa 20 nhân sự.",
    priceMonthly: 49000,
    currency: "VND" as const,
    limits: {
      maxBranches: 1,
      maxEmployees: 20,
      maxManagers: 2,
      maxShiftTemplates: 10,
      maxAssignedShiftsPerMonth: 500,
    },
    features: {
      qrCheckIn: true,
      gpsValidation: true,
      attendanceReports: true,
      shiftSwap: false,
      payroll: false,
    },
  },
  pro_99k: {
    name: "Gói 99k",
    code: "pro_99k",
    description: "Full chức năng cho doanh nghiệp đang mở rộng.",
    priceMonthly: 99000,
    currency: "VND" as const,
    limits: {
      maxBranches: 999999,
      maxEmployees: 999999,
      maxManagers: 999999,
      maxShiftTemplates: 999999,
      maxAssignedShiftsPerMonth: 999999,
    },
    features: {
      qrCheckIn: true,
      gpsValidation: true,
      attendanceReports: true,
      shiftSwap: true,
      payroll: true,
    },
  },
};

const getDocumentId = (document: { _id: unknown }) => document._id as Types.ObjectId;

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000);

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
    throw new AppError(403, "Chỉ chủ sở hữu hoặc quản trị viên mới có thể quản lý thanh toán");
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

const buildTransferContent = (payment: IPayment) => `SSPAY-${payment.orderCode}`;

const buildBankTransferInfo = (payment: IPayment) => {
  if (payment.paymentMethod !== "bank_transfer") {
    return undefined;
  }

  const bankBin = process.env.VIETQR_BANK_BIN;
  const accountNo = process.env.VIETQR_ACCOUNT_NO;
  const accountName = process.env.VIETQR_ACCOUNT_NAME;
  const template = process.env.VIETQR_TEMPLATE || DEFAULT_VIETQR_TEMPLATE;

  if (!bankBin || !accountNo || !accountName) {
    throw new AppError(500, "VietQR environment is not configured");
  }

  const transferContent = buildTransferContent(payment);
  const query = new URLSearchParams({
    amount: String(Math.round(payment.amount)),
    addInfo: transferContent,
    accountName,
  });

  return {
    bankBin,
    accountNo,
    accountName,
    template,
    transferContent,
    qrImageUrl: `https://img.vietqr.io/image/${bankBin}-${accountNo}-${template}.png?${query.toString()}`,
  };
};

const toPublicPayment = (payment: IPayment) => ({
  id: getDocumentId(payment).toString(),
  purpose: payment.purpose,
  provider: payment.provider,
  paymentMethod: payment.paymentMethod,
  paymentStatus: payment.paymentStatus,
  amount: payment.amount,
  currency: payment.currency,
  orderCode: payment.orderCode,
  ...(payment.organizationId
    ? { organizationId: payment.organizationId.toString() }
    : {}),
  ...(payment.ownerId ? { ownerId: payment.ownerId.toString() } : {}),
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
  ...(payment.expiresAt ? { expiresAt: payment.expiresAt } : {}),
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

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createRandomToken = () => crypto.randomBytes(32).toString("hex");

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
    throw new AppError(502, result.desc || "Không thể tạo liên kết thanh toán PayOS");
  }

  payment.checkoutUrl = result.data.checkoutUrl;
  if (result.data.paymentLinkId) {
    payment.payosPaymentLinkId = result.data.paymentLinkId;
  }
  await payment.save();
};

const assertPayosAmountMatchesPayment = (
  payment: IPayment,
  payosAmount: unknown
) => {
  if (payosAmount === undefined || payosAmount === null) {
    return;
  }

  const amount = Number(payosAmount);

  if (
    !Number.isFinite(amount) ||
    Math.round(amount) !== Math.round(payment.amount)
  ) {
    throw new AppError(400, "PayOS payment amount does not match");
  }
};

const getPayosPaymentStatus = async (orderCode: number) => {
  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;

  if (!clientId || !apiKey) {
    return null;
  }

  const response = await fetch(`${PAYOS_API_URL}/${orderCode}`, {
    method: "GET",
    headers: {
      "x-client-id": clientId,
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    return null;
  }

  const result = (await response.json()) as {
    code?: string;
    data?: {
      status?: string;
      amount?: number;
      transactions?: Array<{
        reference?: string;
        transactionCode?: string;
      }>;
    };
  };

  if (result.code !== "00" || !result.data) {
    return null;
  }

  const latestTransaction = result.data.transactions?.[0];

  return {
    status: result.data.status,
    amount: result.data.amount,
    transactionCode:
      latestTransaction?.reference ??
      latestTransaction?.transactionCode ??
      String(orderCode),
  };
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

const ensureDefaultRegistrationPlan = async (
  planCode: keyof typeof DEFAULT_REGISTRATION_PLANS
) => {
  const planPayload = DEFAULT_REGISTRATION_PLANS[planCode];

  await SubscriptionPlanModel.updateOne(
    { code: planPayload.code, deletedAt: { $exists: false } },
    {
      $set: {
        ...planPayload,
        status: "active",
      },
    },
    { upsert: true }
  );

  const plan = await SubscriptionPlanModel.findOne({
    code: planPayload.code,
    deletedAt: { $exists: false },
  });

  if (!plan) {
    throw new AppError(500, "Không thể khởi tạo gói đăng ký");
  }

  return plan;
};

const toPublicUser = async (user: IUser) => {
  const branch = user.branchId ? await BranchModel.findById(user.branchId) : null;

  return {
    id: getDocumentId(user).toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    employeeType: user.employeeType,
    joinDate: user.joinDate,
    status: user.status,
    isEmailVerified: user.isEmailVerified,
    lastLoginAt: user.lastLoginAt,
    ...(user.phone ? { phone: user.phone } : {}),
    ...(user.avatar ? { avatar: user.avatar } : {}),
    ...(user.branchId ? { branchId: user.branchId.toString() } : {}),
    ...(branch ? { branchName: branch.name } : {}),
    ...(user.organizationId ? { organizationId: user.organizationId.toString() } : {}),
    ...(user.employeeCode ? { employeeCode: user.employeeCode } : {}),
  };
};

const buildTokenPair = async (user: IUser) => {
  const payload = {
    userId: getDocumentId(user).toString(),
    role: user.role,
    ...(user.organizationId ? { organizationId: user.organizationId.toString() } : {}),
    ...(user.branchId ? { branchId: user.branchId.toString() } : {}),
  };
  const accessToken = createToken(payload);
  const refreshToken = createRefreshToken(payload);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  return {
    accessToken,
    refreshToken,
  };
};

const expireStaleRegistrationIntents = async () => {
  const now = new Date();
  const staleIntents = await RegistrationIntentModel.find({
    status: "pending",
    expiresAt: { $lte: now },
  }).select("_id paymentId");
  const stalePaymentIds = staleIntents
    .map((intent) => intent.paymentId)
    .filter((paymentId): paymentId is Types.ObjectId => Boolean(paymentId));

  if (!staleIntents.length) {
    return;
  }

  await Promise.all([
    RegistrationIntentModel.updateMany(
      { _id: { $in: staleIntents.map((intent) => getDocumentId(intent)) } },
      { $set: { status: "expired" } }
    ),
    stalePaymentIds.length
      ? PaymentModel.updateMany(
          { _id: { $in: stalePaymentIds }, paymentStatus: "pending" },
          { $set: { paymentStatus: "expired" } }
        )
      : Promise.resolve(),
  ]);
};

const toPublicRegistrationIntent = async (intentId: string) => {
  const intent = await RegistrationIntentModel.findById(intentId);

  if (!intent) {
    throw new AppError(404, "Registration intent not found");
  }

  if (intent.status === "pending" && intent.expiresAt <= new Date()) {
    intent.status = "expired";
    await intent.save();
    if (intent.paymentId) {
      await PaymentModel.updateOne(
        { _id: intent.paymentId, paymentStatus: "pending" },
        { $set: { paymentStatus: "expired" } }
      );
    }
  }

  const payment = intent.paymentId
    ? await PaymentModel.findById(intent.paymentId)
    : null;

  return {
    id: getDocumentId(intent).toString(),
    status: intent.status,
    email: intent.email,
    expiresAt: intent.expiresAt,
    ...(intent.userId ? { userId: intent.userId.toString() } : {}),
    ...(intent.organizationId
      ? { organizationId: intent.organizationId.toString() }
      : {}),
    ...(intent.branchId ? { branchId: intent.branchId.toString() } : {}),
    ...(payment ? { payment: toPublicPayment(payment) } : {}),
  };
};

const resumeActiveRegistrationCheckout = async (intent: {
  _id: unknown;
  paymentId?: Types.ObjectId;
  completionTokenHash: string;
  save: () => Promise<unknown>;
}) => {
  const payment = intent.paymentId ? await PaymentModel.findById(intent.paymentId) : null;

  if (!payment) {
    throw new AppError(409, "A pending checkout exists but payment is missing");
  }

  if (payment.paymentStatus === "paid") {
    await completePaidRegistrationIntent(payment, payment.transactionCode);
    throw new AppError(409, "Registration payment is already completed. Please log in.");
  }

  if (payment.provider === "payos" && payment.paymentStatus === "pending") {
    const payosStatus = await getPayosPaymentStatus(payment.orderCode);

    if (payosStatus?.status === "PAID") {
      assertPayosAmountMatchesPayment(payment, payosStatus.amount);
      await completePaidRegistrationIntent(payment, payosStatus.transactionCode);
      throw new AppError(409, "Registration payment is already completed. Please log in.");
    }
  }

  if (payment.paymentStatus !== "pending" || !payment.checkoutUrl) {
    throw new AppError(409, "Previous checkout is no longer available");
  }

  const completionToken = createRandomToken();
  intent.completionTokenHash = hashToken(completionToken);
  await intent.save();

  return {
    intentId: getDocumentId(intent).toString(),
    completionToken,
    checkoutUrl: payment.checkoutUrl,
    payment: toPublicPayment(payment),
  };
};

const createRegistrationCheckout = async (
  payload: CreateRegistrationCheckoutInput
) => {
  await expireStaleRegistrationIntents();

  const [existingUser, activeIntent] = await Promise.all([
    UserModel.findOne({ email: payload.email }),
    RegistrationIntentModel.findOne({
      email: payload.email,
      status: "pending",
      expiresAt: { $gt: new Date() },
    }),
  ]);

  if (existingUser) {
    throw new AppError(409, "Email already exists");
  }

  if (activeIntent) {
    return resumeActiveRegistrationCheckout(activeIntent);
  }

  const plan = await ensureDefaultRegistrationPlan(payload.planCode);
  const completionToken = createRandomToken();
  const expiresAt = addMinutes(new Date(), REGISTRATION_CHECKOUT_TTL_MINUTES);
  const organizationPayload = {
    name: payload.organization.name,
    ...(payload.organization.businessType
      ? { businessType: payload.organization.businessType }
      : {}),
    ...(payload.organization.phone ? { phone: payload.organization.phone } : {}),
    ...(payload.organization.email ? { email: payload.organization.email } : {}),
    ...(payload.organization.address ? { address: payload.organization.address } : {}),
  };
  const branchPayload = {
    name: payload.branch.name,
    ...(payload.branch.address ? { address: payload.branch.address } : {}),
    ...(payload.branch.phone ? { phone: payload.branch.phone } : {}),
  };
  const intent = new RegistrationIntentModel({
    fullName: payload.fullName,
    email: payload.email,
    passwordHash: await hashPassword(payload.password),
    ...(payload.phone ? { phone: payload.phone } : {}),
    organization: organizationPayload,
    branch: branchPayload,
    planId: getDocumentId(plan),
    status: "pending",
    completionTokenHash: hashToken(completionToken),
    expiresAt,
  });
  await intent.save();

  const payment = await PaymentModel.create({
    purpose: "registration",
    provider: "payos",
    paymentMethod: "payos",
    paymentStatus: "pending",
    amount: plan.priceMonthly,
    currency: plan.currency,
    months: 1,
    orderCode: buildOrderCode(),
    expiresAt,
    note: `Registration checkout ${getDocumentId(intent).toString()}`,
  });

  intent.paymentId = getDocumentId(payment);
  await intent.save();

  try {
    await createPayosLink(payment, `SmartShift ${plan.code}`);
  } catch (error) {
    intent.status = "failed";
    payment.paymentStatus = "failed";
    payment.failedAt = new Date();
    await Promise.all([intent.save(), payment.save()]);
    throw error;
  }

  return {
    intentId: getDocumentId(intent).toString(),
    completionToken,
    checkoutUrl: payment.checkoutUrl,
    payment: toPublicPayment(payment),
  };
};

const completePaidRegistrationIntent = async (
  payment: IPayment,
  transactionCode?: string
) => {
  const intent = await RegistrationIntentModel.findOne({
    paymentId: getDocumentId(payment),
  }).select("+passwordHash");

  if (!intent) {
    throw new AppError(404, "Registration intent not found");
  }

  if (intent.status === "paid" && intent.userId) {
    if (payment.paymentStatus !== "paid") {
      payment.paymentStatus = "paid";
      payment.paidAt = new Date();
      if (transactionCode) payment.transactionCode = transactionCode;
      await payment.save();
    }

    return toPublicRegistrationIntent(getDocumentId(intent).toString());
  }

  if (intent.status !== "pending") {
    throw new AppError(400, "Registration intent is not pending");
  }

  if (intent.expiresAt <= new Date()) {
    intent.status = "expired";
    payment.paymentStatus = "expired";
    await Promise.all([intent.save(), payment.save()]);
    throw new AppError(400, "Registration intent has expired");
  }

  const existingUser = await UserModel.findOne({ email: intent.email });

  if (existingUser) {
    intent.status = "failed";
    payment.paymentStatus = "failed";
    payment.failedAt = new Date();
    await Promise.all([intent.save(), payment.save()]);
    throw new AppError(409, "Email already exists");
  }

  const plan = await SubscriptionPlanModel.findById(intent.planId);

  if (!plan || plan.deletedAt || plan.status !== "active") {
    throw new AppError(404, "Subscription plan not found");
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const [user] = await UserModel.create(
        [
          {
            fullName: intent.fullName,
            email: intent.email,
            password: intent.passwordHash,
            role: "owner",
            status: "active",
            ...(intent.phone ? { phone: intent.phone } : {}),
          },
        ],
        { session }
      );
      if (!user) {
        throw new AppError(500, "Không thể tạo chủ sở hữu");
      }

      const userId = getDocumentId(user);
      const [organization] = await OrganizationModel.create(
        [
          {
            name: intent.organization.name,
            ownerId: userId,
            createdBy: userId,
            status: "active",
            subscription: {
              plan: plan.code === "pro_99k" ? "pro" : "basic",
              status: "active",
              startedAt: new Date(),
              expiredAt: addMonths(new Date(), 1),
              maxBranches: plan.limits.maxBranches,
              maxEmployees: plan.limits.maxEmployees,
            },
            ...(intent.organization.businessType
              ? { businessType: intent.organization.businessType }
              : {}),
            ...(intent.organization.phone ? { phone: intent.organization.phone } : {}),
            ...(intent.organization.email ? { email: intent.organization.email } : {}),
            ...(intent.organization.address
              ? { address: intent.organization.address }
              : {}),
          },
        ],
        { session }
      );
      if (!organization) {
        throw new AppError(500, "Không thể tạo doanh nghiệp");
      }

      const organizationId = getDocumentId(organization);
      const [branch] = await BranchModel.create(
        [
          {
            organizationId,
            name: intent.branch.name,
            ownerId: userId,
            createdBy: userId,
            status: "active",
            ...(intent.branch.address ? { address: intent.branch.address } : {}),
            ...(intent.branch.phone ? { phone: intent.branch.phone } : {}),
          },
        ],
        { session }
      );
      if (!branch) {
        throw new AppError(500, "Không thể tạo chi nhánh");
      }

      const startDate = new Date();
      const endDate = addMonths(startDate, 1);
      const [subscription] = await SubscriptionModel.create(
        [
          {
            organizationId,
            ownerId: userId,
            ...snapshotPlan(plan),
            startDate,
            endDate,
            status: "active",
            autoRenew: false,
            createdBy: userId,
          },
        ],
        { session }
      );
      if (!subscription) {
        throw new AppError(500, "Không thể tạo gói đăng ký");
      }

      await UserModel.updateOne(
        { _id: userId },
        {
          $set: {
            organizationId,
            branchId: getDocumentId(branch),
          },
        },
        { session }
      );

      await OrganizationModel.updateOne(
        { _id: organizationId },
        { $set: { subscriptionId: getDocumentId(subscription) } },
        { session }
      );

      await PaymentModel.updateOne(
        { _id: getDocumentId(payment) },
        {
          $set: {
            paymentStatus: "paid",
            paidAt: new Date(),
            transactionCode,
            ownerId: userId,
            organizationId,
            subscriptionId: getDocumentId(subscription),
          },
        },
        { session }
      );

      await RegistrationIntentModel.updateOne(
        { _id: getDocumentId(intent) },
        {
          $set: {
            status: "paid",
            paidAt: new Date(),
            completedAt: new Date(),
            userId,
            organizationId,
            branchId: getDocumentId(branch),
          },
        },
        { session }
      );
    });
  } catch (error) {
    const completedIntent = await RegistrationIntentModel.findOne({
      _id: getDocumentId(intent),
      status: "paid",
      userId: { $exists: true },
    });

    if (completedIntent) {
      return toPublicRegistrationIntent(getDocumentId(intent).toString());
    }

    throw error;
  } finally {
    await session.endSession();
  }

  return toPublicRegistrationIntent(getDocumentId(intent).toString());
};

const completeRegistration = async (
  intentId: string,
  payload: CompleteRegistrationInput
) => {
  const intent = await RegistrationIntentModel.findById(intentId).select(
    "+completionTokenHash"
  );

  if (!intent) {
    throw new AppError(404, "Registration intent not found");
  }

  if (intent.completionTokenHash !== hashToken(payload.completionToken)) {
    throw new AppError(403, "Invalid completion token");
  }

  if (intent.status !== "paid" || !intent.userId) {
    const payment = intent.paymentId
      ? await PaymentModel.findById(intent.paymentId)
      : null;

    if (payment?.paymentStatus === "paid") {
      await completePaidRegistrationIntent(payment, payment.transactionCode);
    } else if (
      payment?.provider === "payos" &&
      payment.paymentStatus === "pending"
    ) {
      const payosStatus = await getPayosPaymentStatus(payment.orderCode);

      if (payosStatus?.status === "PAID") {
        assertPayosAmountMatchesPayment(payment, payosStatus.amount);
        await completePaidRegistrationIntent(payment, payosStatus.transactionCode);
      }
    }

    const refreshedIntent = await RegistrationIntentModel.findById(intentId);

    if (refreshedIntent?.status === "paid" && refreshedIntent.userId) {
      const user = await UserModel.findById(refreshedIntent.userId);

      if (!user) {
        throw new AppError(404, "Registered user not found");
      }

      const tokens = await buildTokenPair(user);

      return {
        completed: true,
        ...tokens,
        user: await toPublicUser(user),
        intent: await toPublicRegistrationIntent(intentId),
      };
    }

    return {
      completed: false,
      intent: await toPublicRegistrationIntent(intentId),
    };
  }

  const user = await UserModel.findById(intent.userId);

  if (!user) {
    throw new AppError(404, "Registered user not found");
  }

  const tokens = await buildTokenPair(user);

  return {
    completed: true,
    ...tokens,
    user: await toPublicUser(user),
    intent: await toPublicRegistrationIntent(intentId),
  };
};

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
      status: "pending",
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
    ...(payment.paymentMethod === "bank_transfer"
      ? { bankTransfer: buildBankTransferInfo(payment) }
      : {}),
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

  await SubscriptionModel.updateMany(
    {
      organizationId: subscription.organizationId,
      status: "active",
      _id: { $ne: getDocumentId(subscription) },
    },
    {
      $set: {
        status: "cancelled",
        cancelledAt: new Date(),
        ...(payment.updatedBy ? { updatedBy: payment.updatedBy } : {}),
      },
    }
  );

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
    throw new AppError(400, "Không thể đánh dấu giao dịch này là đã thanh toán");
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
    throw new AppError(404, "Không tìm thấy giao dịch thanh toán");
  }

  if (!payment.organizationId) {
    throw new AppError(400, "Giao dịch thanh toán chưa liên kết với doanh nghiệp");
  }

  if (status === "refunded" && payment.purpose === "subscription") {
    throw new AppError(
      400,
      "Không thể hoàn tiền trực tiếp cho thanh toán gói đăng ký"
    );
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
    throw new AppError(404, "Không tìm thấy giao dịch thanh toán");
  }

  if (!payment.organizationId) {
    throw new AppError(400, "Giao dịch thanh toán chưa liên kết với doanh nghiệp");
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
    throw new AppError(404, "Không tìm thấy giao dịch thanh toán");
  }

  if (!payment.organizationId) {
    throw new AppError(400, "Giao dịch thanh toán chưa liên kết với doanh nghiệp");
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
    throw new AppError(404, "Không tìm thấy giao dịch thanh toán");
  }

  const code = String(data.code ?? "");

  if (code === "00") {
    assertPayosAmountMatchesPayment(payment, data.amount);

    if (payment.purpose === "registration") {
      return completePaidRegistrationIntent(
        payment,
        String(data.reference ?? data.transactionCode ?? orderCode)
      );
    }

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
  createRegistrationCheckout,
  getRegistrationIntent: toPublicRegistrationIntent,
  completeRegistration,
  expireRegistrationCheckouts: expireStaleRegistrationIntents,
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
