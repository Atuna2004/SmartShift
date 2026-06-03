import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import crypto from "node:crypto";
import { Types } from "mongoose";
import { AttendanceModel } from "../dist/modules/attendance/attendance.model.js";
import { OrganizationModel } from "../dist/modules/organization/organization.model.js";
import { PaymentModel } from "../dist/modules/payment/payment.model.js";
import { PaymentService } from "../dist/modules/payment/payment.service.js";
import {
  SubscriptionModel,
  SubscriptionPlanModel,
} from "../dist/modules/subscription/subscription.model.js";
import { UserModel } from "../dist/modules/user/user.model.js";

const organizationId = new Types.ObjectId("64c000000000000000000001");
const ownerId = new Types.ObjectId("64a000000000000000000001");
const staffId = new Types.ObjectId("64a000000000000000000003");
const planId = new Types.ObjectId("64f000000000000000000001");
const subscriptionId = new Types.ObjectId("650000000000000000000001");
const paymentId = new Types.ObjectId("651000000000000000000001");

const originals = [];

const stub = (target, key, value) => {
  originals.push([target, key, target[key]]);
  target[key] = value;
};

afterEach(() => {
  while (originals.length) {
    const [target, key, value] = originals.pop();
    target[key] = value;
  }
  delete process.env.PAYOS_CHECKSUM_KEY;
  delete process.env.VIETQR_BANK_BIN;
  delete process.env.VIETQR_ACCOUNT_NO;
  delete process.env.VIETQR_ACCOUNT_NAME;
  delete process.env.VIETQR_TEMPLATE;
});

const actorPayload = (user) => ({
  userId: user._id.toString(),
  role: user.role,
  ...(user.organizationId ? { organizationId: user.organizationId.toString() } : {}),
});

const createUserDoc = (overrides = {}) => ({
  _id: overrides._id ?? ownerId,
  fullName: "Owner",
  email: "owner@example.com",
  role: overrides.role ?? "owner",
  status: overrides.status ?? "active",
  organizationId: overrides.organizationId ?? organizationId,
  branchId: overrides.branchId,
  hourlyRate: overrides.hourlyRate,
  ...overrides,
});

const createOrganizationDoc = (overrides = {}) => ({
  _id: overrides._id ?? organizationId,
  name: "SmartShift Org",
  ownerId,
  subscriptionId: overrides.subscriptionId,
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

const createPlanDoc = (overrides = {}) => ({
  _id: overrides._id ?? planId,
  name: "Basic",
  code: "basic",
  priceMonthly: 199000,
  currency: "VND",
  limits: {
    maxBranches: 2,
    maxEmployees: 30,
    maxManagers: 3,
  },
  features: {
    qrCheckIn: true,
    gpsValidation: true,
    attendanceReports: true,
    shiftSwap: true,
    payroll: true,
  },
  status: "active",
  ...overrides,
});

const createSubscriptionDoc = (overrides = {}) => ({
  _id: overrides._id ?? subscriptionId,
  organizationId,
  ownerId,
  planId,
  planCode: "basic",
  planName: "Basic",
  priceMonthly: 199000,
  currency: "VND",
  limits: {
    maxBranches: 2,
    maxEmployees: 30,
    maxManagers: 3,
  },
  features: {
    qrCheckIn: true,
    gpsValidation: true,
    attendanceReports: true,
    shiftSwap: true,
    payroll: true,
  },
  startDate: new Date("2026-05-01T00:00:00.000Z"),
  endDate: new Date("2026-06-01T00:00:00.000Z"),
  status: "pending",
  autoRenew: false,
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

const createPaymentDoc = (overrides = {}) => ({
  _id: overrides._id ?? paymentId,
  purpose: overrides.purpose ?? "subscription",
  provider: overrides.provider ?? "manual",
  paymentMethod: overrides.paymentMethod ?? "bank_transfer",
  paymentStatus: overrides.paymentStatus ?? "pending",
  organizationId,
  ownerId,
  subscriptionId: overrides.subscriptionId ?? subscriptionId,
  employeeId: overrides.employeeId,
  amount: overrides.amount ?? 199000,
  currency: overrides.currency ?? "VND",
  months: overrides.months,
  orderCode: overrides.orderCode ?? 123456,
  paidAt: overrides.paidAt,
  transactionCode: overrides.transactionCode,
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

const createAttendanceDoc = (overrides = {}) => ({
  _id: new Types.ObjectId(),
  organizationId,
  employeeId: staffId,
  workDate: overrides.workDate ?? new Date("2026-05-01T00:00:00.000Z"),
  checkInTime: overrides.checkInTime,
  checkOutTime: overrides.checkOutTime,
  overtimeMinutes: overrides.overtimeMinutes ?? 0,
  lateMinutes: overrides.lateMinutes ?? 0,
  ...overrides,
});

const signPayosData = (data, checksumKey) => {
  const rawData = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("&");

  return crypto.createHmac("sha256", checksumKey).update(rawData).digest("hex");
};

test("Create Subscription Payment: creates pending subscription and payment", async () => {
  process.env.VIETQR_BANK_BIN = "970405";
  process.env.VIETQR_ACCOUNT_NO = "5104205120465";
  process.env.VIETQR_ACCOUNT_NAME = "SMARTSHIFT";
  const owner = createUserDoc();
  const organization = createOrganizationDoc();
  const plan = createPlanDoc();
  let createdSubscriptionPayload;
  let createdPaymentPayload;

  stub(UserModel, "findById", async () => owner);
  stub(OrganizationModel, "findById", async () => organization);
  stub(SubscriptionPlanModel, "findById", async () => plan);
  stub(SubscriptionModel, "updateMany", async () => ({ modifiedCount: 0 }));
  stub(SubscriptionModel, "create", async (payload) => {
    createdSubscriptionPayload = payload;
    return createSubscriptionDoc({ _id: subscriptionId, ...payload });
  });
  stub(PaymentModel, "create", async (payload) => {
    createdPaymentPayload = payload;
    return createPaymentDoc({ _id: paymentId, ...payload });
  });

  const result = await PaymentService.createSubscriptionPayment(actorPayload(owner), {
    organizationId: organizationId.toString(),
    planId: planId.toString(),
    months: 2,
    paymentMethod: "bank_transfer",
  });

  assert.equal(result.subscriptionId, subscriptionId.toString());
  assert.equal(result.payment.amount, 398000);
  assert.equal(result.payment.paymentStatus, "pending");
  assert.equal(result.bankTransfer.transferContent, `SSPAY-${result.payment.orderCode}`);
  assert.match(result.bankTransfer.qrImageUrl, /img\.vietqr\.io\/image\/970405-5104205120465-compact2\.png/);
  assert.equal(createdSubscriptionPayload.status, "pending");
  assert.equal(createdPaymentPayload.subscriptionId.toString(), subscriptionId.toString());
  assert.deepEqual(createdSubscriptionPayload.status, "pending");
});

test("Mark Payment Paid: activates pending subscription", async () => {
  const owner = createUserDoc();
  const organization = createOrganizationDoc();
  const payment = createPaymentDoc();
  const subscription = createSubscriptionDoc();

  stub(UserModel, "findById", async () => owner);
  stub(OrganizationModel, "findById", async () => organization);
  stub(PaymentModel, "findById", async () => payment);
  stub(SubscriptionModel, "findById", async () => subscription);
  stub(SubscriptionModel, "updateMany", async () => ({ modifiedCount: 1 }));

  const result = await PaymentService.markPaymentPaid(
    actorPayload(owner),
    paymentId.toString(),
    { transactionCode: "BANK-001" }
  );

  assert.equal(result.paymentStatus, "paid");
  assert.equal(result.transactionCode, "BANK-001");
  assert.equal(subscription.status, "active");
  assert.equal(subscription.saved, true);
});

test("Calculate Payroll: uses attendance hours, overtime and late deductions", async () => {
  const owner = createUserDoc();
  const organization = createOrganizationDoc();
  const staff = createUserDoc({
    _id: staffId,
    role: "staff",
    organizationId,
    hourlyRate: 50000,
  });
  const attendances = [
    createAttendanceDoc({
      checkInTime: new Date("2026-05-01T08:00:00.000Z"),
      checkOutTime: new Date("2026-05-01T16:00:00.000Z"),
      overtimeMinutes: 60,
      lateMinutes: 10,
    }),
  ];

  stub(UserModel, "findById", async (id) =>
    id.toString() === ownerId.toString() ? owner : staff
  );
  stub(OrganizationModel, "findById", async () => organization);
  stub(AttendanceModel, "find", () => ({
    async sort() {
      return attendances;
    },
  }));

  const result = await PaymentService.calculatePayroll(actorPayload(owner), {
    organizationId: organizationId.toString(),
    employeeId: staffId.toString(),
    from: new Date("2026-05-01T00:00:00.000Z"),
    to: new Date("2026-05-31T23:59:59.999Z"),
    overtimeMultiplier: 1.5,
    deductionRatePerMinute: 1000,
  });

  assert.equal(result.payroll.workedHours, 8);
  assert.equal(result.payroll.overtimeHours, 1);
  assert.equal(result.payroll.basePay, 400000);
  assert.equal(result.payroll.overtimePay, 75000);
  assert.equal(result.payroll.deductions, 10000);
  assert.equal(result.payroll.netAmount, 465000);
});

test("Create Payroll Payment: creates manual payroll payment from calculation", async () => {
  const owner = createUserDoc();
  const organization = createOrganizationDoc();
  const staff = createUserDoc({ _id: staffId, role: "staff", organizationId });
  const attendance = createAttendanceDoc({
    checkInTime: new Date("2026-05-01T08:00:00.000Z"),
    checkOutTime: new Date("2026-05-01T12:00:00.000Z"),
  });
  let createdPayload;

  stub(UserModel, "findById", async (id) =>
    id.toString() === ownerId.toString() ? owner : staff
  );
  stub(OrganizationModel, "findById", async () => organization);
  stub(AttendanceModel, "find", () => ({
    async sort() {
      return [attendance];
    },
  }));
  stub(PaymentModel, "create", async (payload) => {
    createdPayload = payload;
    return createPaymentDoc({ _id: paymentId, purpose: "payroll", ...payload });
  });

  const result = await PaymentService.createPayrollPayment(actorPayload(owner), {
    organizationId: organizationId.toString(),
    employeeId: staffId.toString(),
    from: new Date("2026-05-01T00:00:00.000Z"),
    to: new Date("2026-05-31T23:59:59.999Z"),
    hourlyRate: 50000,
    overtimeMultiplier: 1.5,
    deductionRatePerMinute: 0,
    paymentMethod: "bank_transfer",
  });

  assert.equal(result.purpose, "payroll");
  assert.equal(result.amount, 200000);
  assert.equal(createdPayload.payrollMeta.workedHours, 4);
});

test("PayOS Webhook: verifies signature and marks payment paid", async () => {
  process.env.PAYOS_CHECKSUM_KEY = "checksum-key";
  const payment = createPaymentDoc({ orderCode: 987654, provider: "payos" });
  const subscription = createSubscriptionDoc();
  const data = {
    code: "00",
    orderCode: 987654,
    reference: "PAYOS-REF",
  };

  stub(PaymentModel, "findOne", async () => payment);
  stub(SubscriptionModel, "findById", async () => subscription);
  stub(SubscriptionModel, "updateMany", async () => ({ modifiedCount: 1 }));
  stub(OrganizationModel, "findById", async () => createOrganizationDoc());

  const result = await PaymentService.handlePayosWebhook({
    data,
    signature: signPayosData(data, process.env.PAYOS_CHECKSUM_KEY),
  });

  assert.equal(result.paymentStatus, "paid");
  assert.equal(result.transactionCode, "PAYOS-REF");
  assert.equal(subscription.status, "active");
});
