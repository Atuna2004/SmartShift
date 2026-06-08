import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Types } from "mongoose";
import { BranchModel } from "../dist/modules/branch/branch.model.js";
import { OrganizationModel } from "../dist/modules/organization/organization.model.js";
import { ScheduleModel } from "../dist/modules/schedule/schedule.model.js";
import { ShiftTemplateModel } from "../dist/modules/shift/shift-template.model.js";
import {
  SubscriptionModel,
  SubscriptionPlanModel,
} from "../dist/modules/subscription/subscription.model.js";
import { SubscriptionService } from "../dist/modules/subscription/subscription.service.js";
import { UserModel } from "../dist/modules/user/user.model.js";

const organizationId = new Types.ObjectId("64c000000000000000000001");
const ownerId = new Types.ObjectId("64a000000000000000000001");
const staffId = new Types.ObjectId("64a000000000000000000003");
const planId = new Types.ObjectId("64f000000000000000000001");
const proPlanId = new Types.ObjectId("64f000000000000000000002");
const subscriptionId = new Types.ObjectId("650000000000000000000001");

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
  ...overrides,
});

const createOrganizationDoc = (overrides = {}) => ({
  _id: overrides._id ?? organizationId,
  name: "SmartShift Org",
  ownerId: overrides.ownerId ?? ownerId,
  subscriptionId: overrides.subscriptionId,
  status: "active",
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

const createPlanDoc = (overrides = {}) => ({
  _id: overrides._id ?? planId,
  name: overrides.name ?? "Basic",
  code: overrides.code ?? "basic",
  description: overrides.description,
  priceMonthly: overrides.priceMonthly ?? 199000,
  currency: overrides.currency ?? "VND",
  limits: overrides.limits ?? {
    maxBranches: 2,
    maxEmployees: 30,
    maxManagers: 3,
    maxShiftTemplates: 10,
    maxAssignedShiftsPerMonth: 500,
  },
  features: overrides.features ?? {
    qrCheckIn: true,
    gpsValidation: true,
    attendanceReports: true,
    shiftSwap: true,
    payroll: false,
  },
  status: overrides.status ?? "active",
  async save() {
    this.saved = true;
    return this;
  },
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
    maxShiftTemplates: 10,
    maxAssignedShiftsPerMonth: 500,
  },
  features: {
    qrCheckIn: true,
    gpsValidation: true,
    attendanceReports: true,
    shiftSwap: true,
    payroll: false,
  },
  startDate: new Date("2026-05-01T00:00:00.000Z"),
  endDate: new Date("2026-06-01T00:00:00.000Z"),
  status: "active",
  autoRenew: false,
  set(value) {
    Object.assign(this, value);
  },
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

test("Create Subscription Plan: admin can create active plan", async () => {
  const admin = createUserDoc({ role: "admin", organizationId: undefined });
  let createdPayload;

  stub(UserModel, "findById", async () => admin);
  stub(SubscriptionPlanModel, "findOne", async () => null);
  stub(SubscriptionPlanModel, "create", async (payload) => {
    createdPayload = payload;
    return createPlanDoc({ _id: planId, ...payload });
  });

  const result = await SubscriptionService.createSubscriptionPlan(actorPayload(admin), {
    name: "Basic",
    code: "basic",
    priceMonthly: 199000,
    currency: "VND",
    limits: {
      maxBranches: 2,
      maxEmployees: 30,
      maxManagers: 3,
      maxShiftTemplates: 10,
    },
    features: {
      qrCheckIn: true,
      gpsValidation: true,
      attendanceReports: true,
      shiftSwap: true,
      payroll: false,
    },
  });

  assert.equal(result.id, planId.toString());
  assert.equal(result.status, "active");
  assert.equal(createdPayload.createdBy.toString(), admin._id.toString());
});

test("Create Subscription Plan: owner and staff cannot manage plans", async () => {
  const owner = createUserDoc();
  const staff = createUserDoc({ _id: staffId, role: "staff" });

  stub(UserModel, "findById", async () => owner);

  await assert.rejects(
    () =>
      SubscriptionService.createSubscriptionPlan(actorPayload(owner), {
        name: "Pro",
        code: "pro",
        priceMonthly: 399000,
        currency: "VND",
        limits: {
          maxBranches: 5,
          maxEmployees: 100,
          maxManagers: 10,
        },
        features: {
          qrCheckIn: true,
          gpsValidation: true,
          attendanceReports: true,
          shiftSwap: true,
          payroll: true,
        },
      }),
    { statusCode: 403 }
  );

  UserModel.findById = async () => staff;

  await assert.rejects(
    () =>
      SubscriptionService.createSubscriptionPlan(actorPayload(staff), {
        name: "Pro",
        code: "pro",
        priceMonthly: 399000,
        currency: "VND",
        limits: {
          maxBranches: 5,
          maxEmployees: 100,
          maxManagers: 10,
        },
        features: {
          qrCheckIn: true,
          gpsValidation: true,
          attendanceReports: true,
          shiftSwap: true,
          payroll: true,
        },
      }),
    { statusCode: 403 }
  );
});

test("Subscribe Organization To Plan: admin creates active subscription", async () => {
  const admin = createUserDoc({ role: "admin", organizationId: undefined });
  const organization = createOrganizationDoc();
  const plan = createPlanDoc();
  let updateManyFilter;
  let createdPayload;

  stub(UserModel, "findById", async () => admin);
  stub(OrganizationModel, "findById", async () => organization);
  stub(SubscriptionPlanModel, "findById", async () => plan);
  stub(SubscriptionModel, "updateMany", async (filter) => {
    updateManyFilter = filter;
    return { modifiedCount: 0 };
  });
  stub(SubscriptionModel, "create", async (payload) => {
    createdPayload = payload;
    return createSubscriptionDoc({ _id: subscriptionId, ...payload });
  });

  const result = await SubscriptionService.subscribeOrganizationToPlan(
    actorPayload(admin),
    organizationId.toString(),
    { planId: planId.toString(), autoRenew: true }
  );

  assert.equal(result.id, subscriptionId.toString());
  assert.equal(result.planCode, "basic");
  assert.equal(result.autoRenew, true);
  assert.equal(updateManyFilter.organizationId.toString(), organizationId.toString());
  assert.equal(createdPayload.ownerId.toString(), ownerId.toString());
  assert.equal(organization.subscriptionId.toString(), subscriptionId.toString());
  assert.equal(organization.saved, true);
});

test("Change Subscription Plan: admin snapshots new active plan", async () => {
  const admin = createUserDoc({ role: "admin", organizationId: undefined });
  const organization = createOrganizationDoc();
  const proPlan = createPlanDoc({
    _id: proPlanId,
    name: "Pro",
    code: "pro",
    priceMonthly: 399000,
    features: {
      qrCheckIn: true,
      gpsValidation: true,
      attendanceReports: true,
      shiftSwap: true,
      payroll: true,
    },
  });
  const subscription = createSubscriptionDoc();

  stub(UserModel, "findById", async () => admin);
  stub(OrganizationModel, "findById", async () => organization);
  stub(SubscriptionPlanModel, "findById", async () => proPlan);
  stub(SubscriptionModel, "findOne", () => ({
    async sort() {
      return subscription;
    },
  }));

  const result = await SubscriptionService.changeSubscriptionPlan(actorPayload(admin), {
    organizationId: organizationId.toString(),
    planId: proPlanId.toString(),
  });

  assert.equal(result.planCode, "pro");
  assert.equal(result.planName, "Pro");
  assert.equal(result.features.payroll, true);
  assert.equal(subscription.saved, true);
});

test("Renew Subscription: admin extends from current end date", async () => {
  const admin = createUserDoc({ role: "admin", organizationId: undefined });
  const organization = createOrganizationDoc();
  const subscription = createSubscriptionDoc({
    endDate: new Date("2026-07-01T00:00:00.000Z"),
  });

  stub(UserModel, "findById", async () => admin);
  stub(OrganizationModel, "findById", async () => organization);
  stub(SubscriptionModel, "findOne", () => ({
    async sort() {
      return subscription;
    },
  }));

  const result = await SubscriptionService.renewSubscription(actorPayload(admin), {
    organizationId: organizationId.toString(),
    months: 2,
    autoRenew: true,
  });

  assert.equal(result.endDate.toISOString(), "2026-09-01T00:00:00.000Z");
  assert.equal(result.autoRenew, true);
  assert.equal(subscription.saved, true);
});

test("Cancel Subscription: owner cancels current subscription", async () => {
  const owner = createUserDoc();
  const organization = createOrganizationDoc();
  const subscription = createSubscriptionDoc({ autoRenew: true });

  stub(UserModel, "findById", async () => owner);
  stub(OrganizationModel, "findById", async () => organization);
  stub(SubscriptionModel, "findOne", () => ({
    async sort() {
      return subscription;
    },
  }));

  const result = await SubscriptionService.cancelSubscription(
    actorPayload(owner),
    organizationId.toString()
  );

  assert.equal(result.status, "cancelled");
  assert.equal(result.autoRenew, false);
  assert.equal(subscription.saved, true);
});

test("Check Subscription Limits: returns usage, remaining limits and feature access", async () => {
  const owner = createUserDoc();
  const organization = createOrganizationDoc();
  const subscription = createSubscriptionDoc();

  stub(UserModel, "findById", async () => owner);
  stub(OrganizationModel, "findById", async () => organization);
  stub(SubscriptionModel, "findOne", () => ({
    async sort() {
      return subscription;
    },
  }));
  stub(BranchModel, "countDocuments", async () => 1);
  stub(UserModel, "countDocuments", async (filter) =>
    filter.role === "manager" ? 1 : 12
  );
  stub(ShiftTemplateModel, "countDocuments", async () => 4);
  stub(ScheduleModel, "countDocuments", async () => 120);

  const result = await SubscriptionService.checkSubscriptionLimits(actorPayload(owner), {
    organizationId: organizationId.toString(),
    feature: "payroll",
  });

  assert.equal(result.usage.branches, 1);
  assert.equal(result.limits.branches.remaining, 1);
  assert.equal(result.limits.assignedShiftsPerMonth.remaining, 380);
  assert.equal(result.feature, "payroll");
  assert.equal(result.allowed, false);
});
