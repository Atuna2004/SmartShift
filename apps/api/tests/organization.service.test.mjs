import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Types } from "mongoose";
import { OrganizationModel } from "../dist/modules/organization/organization.model.js";
import { OrganizationService } from "../dist/modules/organization/organization.service.js";
import { UserModel } from "../dist/modules/user/user.model.js";

const organizationId = new Types.ObjectId("64c000000000000000000001");
const otherOrganizationId = new Types.ObjectId("64c000000000000000000002");
const ownerId = new Types.ObjectId("64a000000000000000000001");
const staffId = new Types.ObjectId("64a000000000000000000003");

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
  organizationId: overrides.organizationId,
  async save() {
    this.saved = true;
    return this;
  },
  ...overrides,
});

const createOrganizationDoc = (overrides = {}) => ({
  _id: overrides._id ?? organizationId,
  name: overrides.name ?? "SmartShift Org",
  slug: overrides.slug,
  businessType: overrides.businessType,
  phone: overrides.phone,
  email: overrides.email,
  address: overrides.address,
  logo: overrides.logo,
  status: overrides.status ?? "active",
  settings: overrides.settings ?? {
    timezone: "Asia/Ho_Chi_Minh",
    defaultLateThresholdMinutes: 15,
    defaultQrExpiresInSeconds: 60,
    defaultRequireGps: true,
    defaultAllowEarlyCheckInMinutes: 0,
    defaultAllowLateCheckOutMinutes: 0,
  },
  subscription: overrides.subscription ?? {
    plan: "free",
    status: "trialing",
  },
  ownerId: overrides.ownerId ?? ownerId,
  createdBy: overrides.createdBy ?? ownerId,
  updatedBy: overrides.updatedBy,
  disabledAt: overrides.disabledAt,
  enabledAt: overrides.enabledAt,
  deletedAt: overrides.deletedAt,
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

test("Create Organization: owner creates organization and stores organizationId", async () => {
  const owner = createUserDoc();
  let createdPayload;

  stub(UserModel, "findById", async () => owner);
  stub(OrganizationModel, "findOne", async () => null);
  stub(OrganizationModel, "create", async (payload) => {
    createdPayload = payload;
    return createOrganizationDoc({ _id: organizationId, ...payload });
  });

  const result = await OrganizationService.createOrganization(actorPayload(owner), {
    name: "SmartShift Cafe",
    slug: "smartshift-cafe",
    businessType: "cafe",
    email: "owner@smartshift.test",
  });

  assert.equal(result.id, organizationId.toString());
  assert.equal(result.slug, "smartshift-cafe");
  assert.equal(createdPayload.ownerId.toString(), ownerId.toString());
  assert.equal(owner.organizationId.toString(), organizationId.toString());
  assert.equal(owner.saved, true);
});

test("View My Organization: owner can view organization in scope", async () => {
  const owner = createUserDoc({ organizationId });
  const organization = createOrganizationDoc();

  stub(UserModel, "findById", async () => owner);
  stub(OrganizationModel, "findById", async () => organization);

  const result = await OrganizationService.getMyOrganization(actorPayload(owner));

  assert.equal(result.id, organizationId.toString());
  assert.equal(result.name, "SmartShift Org");
});

test("Update Organization Profile: owner updates basic profile", async () => {
  const owner = createUserDoc({ organizationId });
  const organization = createOrganizationDoc();

  stub(UserModel, "findById", async () => owner);
  stub(OrganizationModel, "findById", async () => organization);
  stub(OrganizationModel, "findOne", async () => null);

  const result = await OrganizationService.updateOrganizationProfile(
    actorPayload(owner),
    {
      name: "Updated Org",
      slug: "updated-org",
      businessType: "retail",
      phone: "0900000001",
    }
  );

  assert.equal(result.name, "Updated Org");
  assert.equal(result.slug, "updated-org");
  assert.equal(result.businessType, "retail");
  assert.equal(organization.updatedBy.toString(), ownerId.toString());
  assert.equal(organization.saved, true);
});

test("Configure Organization Settings: owner updates defaults", async () => {
  const owner = createUserDoc({ organizationId });
  const organization = createOrganizationDoc();

  stub(UserModel, "findById", async () => owner);
  stub(OrganizationModel, "findById", async () => organization);

  const result = await OrganizationService.configureOrganizationSettings(
    actorPayload(owner),
    {
      defaultLateThresholdMinutes: 20,
      defaultRequireGps: false,
    }
  );

  assert.equal(result.settings.defaultLateThresholdMinutes, 20);
  assert.equal(result.settings.defaultRequireGps, false);
  assert.equal(result.settings.timezone, "Asia/Ho_Chi_Minh");
});

test("Configure Subscription Info: owner stores basic subscription metadata", async () => {
  const owner = createUserDoc({ organizationId });
  const organization = createOrganizationDoc();

  stub(UserModel, "findById", async () => owner);
  stub(OrganizationModel, "findById", async () => organization);

  const result = await OrganizationService.configureSubscriptionInfo(
    actorPayload(owner),
    {
      plan: "pro",
      status: "active",
      maxBranches: 5,
      maxEmployees: 100,
    }
  );

  assert.equal(result.subscription.plan, "pro");
  assert.equal(result.subscription.status, "active");
  assert.equal(result.subscription.maxBranches, 5);
});

test("Disable and Enable Organization: owner toggles status", async () => {
  const owner = createUserDoc({ organizationId });
  const organization = createOrganizationDoc();

  stub(UserModel, "findById", async () => owner);
  stub(OrganizationModel, "findById", async () => organization);

  const disabled = await OrganizationService.disableOrganization(
    actorPayload(owner),
    organizationId.toString()
  );

  assert.equal(disabled.status, "disabled");
  assert.ok(organization.disabledAt);

  const enabled = await OrganizationService.enableOrganization(
    actorPayload(owner),
    organizationId.toString()
  );

  assert.equal(enabled.status, "active");
  assert.ok(organization.enabledAt);
  assert.equal(organization.disabledAt, undefined);
});

test("Organization Management: staff cannot manage organization", async () => {
  const staff = createUserDoc({
    _id: staffId,
    role: "staff",
    organizationId: otherOrganizationId,
  });

  stub(UserModel, "findById", async () => staff);

  await assert.rejects(
    () => OrganizationService.getMyOrganization(actorPayload(staff)),
    { statusCode: 403 }
  );
});
