import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Types } from "mongoose";
import { OrganizationModel } from "../dist/modules/organization/organization.model.js";
import { OrganizationService } from "../dist/modules/organization/organization.service.js";
import { SubscriptionPlanModel } from "../dist/modules/subscription/subscription.model.js";
import { SubscriptionService } from "../dist/modules/subscription/subscription.service.js";
import { AuthService } from "../dist/modules/auth/auth.service.js";
import { UserModel } from "../dist/modules/user/user.model.js";
import { UserService } from "../dist/modules/user/user.service.js";

const adminId = new Types.ObjectId("64a000000000000000000099");
const ownerId = new Types.ObjectId("64a000000000000000000001");
const organizationId = new Types.ObjectId("64c000000000000000000001");
const planId = new Types.ObjectId("64f000000000000000000001");

const originals = [];
const envOriginals = new Map();

const stub = (target, key, value) => {
  originals.push([target, key, target[key]]);
  target[key] = value;
};

const setEnv = (key, value) => {
  if (!envOriginals.has(key)) {
    envOriginals.set(key, process.env[key]);
  }
  process.env[key] = value;
};

afterEach(() => {
  while (originals.length) {
    const [target, key, value] = originals.pop();
    target[key] = value;
  }
  for (const [key, value] of envOriginals.entries()) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  envOriginals.clear();
});

const actorPayload = (user) => ({
  userId: user._id.toString(),
  role: user.role,
  ...(user.organizationId ? { organizationId: user.organizationId.toString() } : {}),
});

const createUserDoc = (overrides = {}) => ({
  _id: overrides._id ?? adminId,
  fullName: overrides.fullName ?? "Platform Admin",
  email: overrides.email ?? "admin@smartshift.test",
  password: overrides.password ?? "hashed-password",
  role: overrides.role ?? "admin",
  employeeType: overrides.employeeType ?? "full_time",
  status: overrides.status ?? "active",
  isEmailVerified: false,
  organizationId: overrides.organizationId,
  branchId: overrides.branchId,
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

const createOrganizationDoc = (overrides = {}) => ({
  _id: overrides._id ?? organizationId,
  name: "Tenant Org",
  status: "active",
  settings: {
    timezone: "Asia/Ho_Chi_Minh",
    defaultLateThresholdMinutes: 15,
    defaultQrExpiresInSeconds: 60,
    defaultRequireGps: true,
    defaultAllowEarlyCheckInMinutes: 0,
    defaultAllowLateCheckOutMinutes: 0,
  },
  subscription: {
    plan: "free",
    status: "trialing",
  },
  ownerId,
  createdBy: ownerId,
  set(key, value) {
    if (value === undefined) {
      delete this[key];
      return;
    }
    this[key] = value;
  },
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

test("Register Admin: valid setup secret creates platform admin", async () => {
  setEnv("ADMIN_SETUP_SECRET", "setup-secret");
  setEnv("JWT_ACCESS_SECRET", "access-secret");
  setEnv("JWT_REFRESH_SECRET", "refresh-secret");
  let createdPayload;

  stub(UserModel, "findOne", async () => null);
  stub(UserModel, "create", async (payload) => {
    createdPayload = payload;
    return createUserDoc({ _id: adminId, ...payload });
  });

  const result = await AuthService.registerAdmin({
    fullName: "Platform Admin",
    email: "admin@smartshift.test",
    password: "Password123!",
    setupSecret: "setup-secret",
  });

  assert.equal(result.user.role, "admin");
  assert.equal(createdPayload.role, "admin");
  assert.ok(result.accessToken);
});

test("Admin Organization Control: admin can disable any tenant organization", async () => {
  const admin = createUserDoc();
  const organization = createOrganizationDoc();

  stub(UserModel, "findById", async () => admin);
  stub(OrganizationModel, "findById", async () => organization);

  const result = await OrganizationService.disableOrganization(
    actorPayload(admin),
    organizationId.toString()
  );

  assert.equal(result.status, "disabled");
  assert.equal(organization.saved, true);
});

test("Admin Subscription Control: admin can create subscription plans", async () => {
  const admin = createUserDoc();
  let createdPayload;

  stub(UserModel, "findById", async () => admin);
  stub(SubscriptionPlanModel, "findOne", async () => null);
  stub(SubscriptionPlanModel, "create", async (payload) => {
    createdPayload = payload;
    return {
      _id: planId,
      ...payload,
      async save() {
        return this;
      },
    };
  });

  const result = await SubscriptionService.createSubscriptionPlan(actorPayload(admin), {
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
  });

  assert.equal(result.code, "pro");
  assert.equal(createdPayload.createdBy.toString(), adminId.toString());
});

test("Admin User Control: admin can list users across tenants", async () => {
  const admin = createUserDoc();
  const owner = createUserDoc({
    _id: ownerId,
    role: "owner",
    organizationId,
    email: "owner@tenant.test",
  });
  let capturedFilter;

  stub(UserModel, "findById", async () => admin);
  stub(UserModel, "find", (filter) => {
    capturedFilter = filter;
    return {
      sort() {
        return this;
      },
      skip() {
        return this;
      },
      async limit() {
        return [owner];
      },
    };
  });
  stub(UserModel, "countDocuments", async () => 1);

  const result = await UserService.getEmployeeList(actorPayload(admin), {
    role: "owner",
    organizationId: organizationId.toString(),
    page: 1,
    limit: 20,
  });

  assert.equal(result.data[0].role, "owner");
  assert.equal(capturedFilter.organizationId.toString(), organizationId.toString());
});
