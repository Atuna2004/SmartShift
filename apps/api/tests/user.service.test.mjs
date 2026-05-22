import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { Types } from "mongoose";
import { BranchModel } from "../dist/modules/branch/branch.model.js";
import { UserModel } from "../dist/modules/user/user.model.js";
import { UserService } from "../dist/modules/user/user.service.js";

const ownerId = new Types.ObjectId("64a000000000000000000001");
const managerId = new Types.ObjectId("64a000000000000000000002");
const staffId = new Types.ObjectId("64a000000000000000000003");
const branchId = new Types.ObjectId("64b000000000000000000001");
const otherBranchId = new Types.ObjectId("64b000000000000000000002");

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
  ...(user.branchId ? { branchId: user.branchId.toString() } : {}),
  ...(user.organizationId ? { organizationId: user.organizationId.toString() } : {}),
});

const createUserDoc = (overrides = {}) => ({
  _id: overrides._id ?? new Types.ObjectId(),
  fullName: overrides.fullName ?? "Nguyen Van A",
  email: overrides.email ?? "user@example.com",
  password: overrides.password ?? "hashed-password",
  role: overrides.role ?? "staff",
  employeeType: overrides.employeeType ?? "part_time",
  status: overrides.status ?? "active",
  isEmailVerified: overrides.isEmailVerified ?? false,
  branchId: overrides.branchId,
  organizationId: overrides.organizationId,
  employeeCode: overrides.employeeCode,
  joinDate: overrides.joinDate,
  createdBy: overrides.createdBy,
  phone: overrides.phone,
  avatar: overrides.avatar,
  lastLoginAt: overrides.lastLoginAt,
  async save() {
    this.saved = true;
    return this;
  },
  set(key, value) {
    if (value === undefined) {
      delete this[key];
      return;
    }

    this[key] = value;
  },
  ...overrides,
});

const createBranchDoc = (overrides = {}) => ({
  _id: overrides._id ?? branchId,
  name: overrides.name ?? "Branch 1",
  address: overrides.address ?? "Address",
  ownerId: overrides.ownerId ?? ownerId,
  managerId: overrides.managerId,
  organizationId: overrides.organizationId,
  status: overrides.status ?? "active",
  qrCheckinEnabled: true,
  lateThresholdMinutes: 15,
  timezone: "Asia/Ho_Chi_Minh",
  async save() {
    this.saved = true;
    return this;
  },
  set(key, value) {
    if (value === undefined) {
      delete this[key];
      return;
    }

    this[key] = value;
  },
  ...overrides,
});

const stubFindByIdQueue = (...docs) => {
  const queue = [...docs];
  stub(UserModel, "findById", async () => queue.shift() ?? null);
};

test("Create Employee: owner can create staff in an owned branch", async () => {
  const owner = createUserDoc({ _id: ownerId, role: "owner" });
  const branch = createBranchDoc();
  let createdPayload;

  stubFindByIdQueue(owner);
  stub(UserModel, "findOne", async () => null);
  stub(BranchModel, "findById", async () => branch);
  stub(UserModel, "create", async (payload) => {
    createdPayload = payload;
    return createUserDoc({
      _id: staffId,
      ...payload,
    });
  });

  const result = await UserService.createEmployee(actorPayload(owner), {
    fullName: "Nguyen Van A",
    email: "staff@example.com",
    password: "12345678",
    phone: "0900000000",
    role: "staff",
    branchId: branchId.toString(),
  });

  assert.equal(result.id, staffId.toString());
  assert.equal(result.role, "staff");
  assert.equal(result.branchId, branchId.toString());
  assert.equal(createdPayload.createdBy.toString(), ownerId.toString());
  assert.notEqual(createdPayload.password, "12345678");
});

test("Create Employee: manager cannot create manager", async () => {
  const manager = createUserDoc({
    _id: managerId,
    role: "manager",
    branchId,
    createdBy: ownerId,
  });

  stubFindByIdQueue(manager);
  stub(UserModel, "findOne", async () => null);

  await assert.rejects(
    () =>
      UserService.createEmployee(actorPayload(manager), {
        fullName: "Manager B",
        email: "manager-b@example.com",
        password: "12345678",
        role: "manager",
        branchId: branchId.toString(),
      }),
    { statusCode: 403 }
  );
});

test("Update Employee: manager can update basic staff data in own branch", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const staff = createUserDoc({
    _id: staffId,
    role: "staff",
    branchId,
    createdBy: ownerId,
  });

  stubFindByIdQueue(manager, staff);

  const result = await UserService.updateEmployee(
    actorPayload(manager),
    staffId.toString(),
    { fullName: "Updated Staff", phone: "0911111111" }
  );

  assert.equal(result.fullName, "Updated Staff");
  assert.equal(result.phone, "0911111111");
  assert.equal(staff.saved, true);
});

test("View Employee Detail: owner can view employee in owner scope", async () => {
  const owner = createUserDoc({ _id: ownerId, role: "owner" });
  const staff = createUserDoc({ _id: staffId, role: "staff", createdBy: ownerId });

  stubFindByIdQueue(owner, staff);

  const result = await UserService.getEmployeeById(
    actorPayload(owner),
    staffId.toString()
  );

  assert.equal(result.id, staffId.toString());
});

test("View Employee List: manager only lists staff in own branch", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });
  let capturedFilter;

  stubFindByIdQueue(manager);
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
        return [staff];
      },
    };
  });
  stub(UserModel, "countDocuments", async () => 1);

  const result = await UserService.getEmployeeList(actorPayload(manager), {
    page: 1,
    limit: 20,
  });

  assert.equal(result.meta.total, 1);
  assert.equal(result.data[0].id, staffId.toString());
  assert.equal(capturedFilter.role, "staff");
  assert.equal(capturedFilter.branchId.toString(), branchId.toString());
});

test("Activate Employee: owner can activate employee", async () => {
  const owner = createUserDoc({ _id: ownerId, role: "owner" });
  const staff = createUserDoc({
    _id: staffId,
    role: "staff",
    status: "inactive",
    createdBy: ownerId,
  });

  stubFindByIdQueue(owner, staff);

  const result = await UserService.activateEmployee(
    actorPayload(owner),
    staffId.toString()
  );

  assert.equal(result.status, "active");
  assert.equal(staff.saved, true);
});

test("Deactivate Employee: manager can deactivate staff in own branch", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });

  stubFindByIdQueue(manager, staff);

  const result = await UserService.deactivateEmployee(
    actorPayload(manager),
    staffId.toString()
  );

  assert.equal(result.status, "inactive");
  assert.equal(staff.saved, true);
});

test("Transfer Employee Branch: owner can transfer staff to another owned branch", async () => {
  const owner = createUserDoc({ _id: ownerId, role: "owner" });
  const staff = createUserDoc({
    _id: staffId,
    role: "staff",
    branchId,
    createdBy: ownerId,
  });
  const targetBranch = createBranchDoc({ _id: otherBranchId });

  stubFindByIdQueue(owner, staff);
  stub(BranchModel, "findById", async () => targetBranch);

  const result = await UserService.transferEmployeeBranch(
    actorPayload(owner),
    staffId.toString(),
    { branchId: otherBranchId.toString() }
  );

  assert.equal(result.branchId, otherBranchId.toString());
  assert.equal(staff.saved, true);
});

test("Assign Manager To Branch: owner can assign manager to owned branch", async () => {
  const owner = createUserDoc({ _id: ownerId, role: "owner" });
  const manager = createUserDoc({
    _id: managerId,
    role: "manager",
    createdBy: ownerId,
  });
  const branch = createBranchDoc();

  stubFindByIdQueue(owner, manager);
  stub(BranchModel, "findById", async () => branch);

  const result = await UserService.assignManagerToBranch(
    actorPayload(owner),
    managerId.toString(),
    { branchId: branchId.toString() }
  );

  assert.equal(result.manager.id, managerId.toString());
  assert.equal(result.branch.managerId, managerId.toString());
  assert.equal(manager.branchId.toString(), branchId.toString());
  assert.equal(branch.saved, true);
});

test("Assign Manager To Branch: manager is not allowed to assign managers", async () => {
  const manager = createUserDoc({ _id: managerId, role: "manager", branchId });

  stubFindByIdQueue(manager);

  await assert.rejects(
    () =>
      UserService.assignManagerToBranch(
        actorPayload(manager),
        managerId.toString(),
        { branchId: branchId.toString() }
      ),
    { statusCode: 403 }
  );
});

test("Remove Manager From Branch: owner can remove assigned manager", async () => {
  const owner = createUserDoc({ _id: ownerId, role: "owner" });
  const manager = createUserDoc({
    _id: managerId,
    role: "manager",
    branchId,
    createdBy: ownerId,
  });
  const branch = createBranchDoc({ managerId });

  stubFindByIdQueue(owner, manager);
  stub(BranchModel, "findById", async () => branch);

  const result = await UserService.removeManagerFromBranch(
    actorPayload(owner),
    managerId.toString(),
    { branchId: branchId.toString() }
  );

  assert.equal(result.branch.managerId, null);
  assert.equal(manager.branchId, undefined);
  assert.equal(branch.managerId, undefined);
});

test("Staff cannot use employee admin service", async () => {
  const staff = createUserDoc({ _id: staffId, role: "staff", branchId });

  stubFindByIdQueue(staff);

  await assert.rejects(
    () =>
      UserService.getEmployeeList(actorPayload(staff), {
        page: 1,
        limit: 20,
      }),
    { statusCode: 403 }
  );
});
