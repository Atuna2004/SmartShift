import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { hashPassword } from "../../common/utils/hash.js";
import { BranchModel } from "../branch/branch.model.js";
import { UserModel } from "./user.model.js";
import type { IUser, UserRole } from "./user.model.js";
import type {
  CreateEmployeeInput,
  EmployeeListQuery,
  ManagerBranchInput,
  TransferEmployeeBranchInput,
  UpdateEmployeeInput,
} from "./user.schema.js";

const asObjectId = (value: string) => new Types.ObjectId(value);

const ensureActor = async (actor: AuthTokenPayload, options?: { allowStaff?: boolean }) => {
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

  if (user.role === "staff" && !options?.allowStaff) {
    throw new AppError(403, "Staff cannot manage employees");
  }

  return user;
};

const toPublicUser = (user: IUser) => ({
  id: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  employeeType: user.employeeType,
  status: user.status,
  isEmailVerified: user.isEmailVerified,
  ...(user.phone ? { phone: user.phone } : {}),
  ...(user.avatar ? { avatar: user.avatar } : {}),
  ...(user.branchId ? { branchId: user.branchId.toString() } : {}),
  ...(user.organizationId ? { organizationId: user.organizationId.toString() } : {}),
  ...(user.employeeCode ? { employeeCode: user.employeeCode } : {}),
  ...(user.joinDate ? { joinDate: user.joinDate } : {}),
  ...(user.lastLoginAt ? { lastLoginAt: user.lastLoginAt } : {}),
});

const getOwnerScopeFilter = (owner: IUser) => {
  const filter: Record<string, unknown> = {};

  if (owner.organizationId) {
    filter.organizationId = owner.organizationId;
    return filter;
  }

  filter.createdBy = owner._id;
  return filter;
};

const assertOwnerBranchAccess = async (owner: IUser, branchId: string) => {
  const branch = await BranchModel.findById(branchId);

  if (!branch) {
    throw new AppError(404, "Branch not found");
  }

  const sameOrganization =
    owner.organizationId &&
    branch.organizationId &&
    branch.organizationId.equals(owner.organizationId);
  const ownedByOwner = branch.ownerId.equals(owner._id);

  if (!sameOrganization && !ownedByOwner) {
    throw new AppError(403, "Branch is outside your organization");
  }

  return branch;
};

const assertAdminBranchAccess = async (organizationId: string | undefined, branchId: string) => {
  const branch = await BranchModel.findById(branchId);

  if (!branch) {
    throw new AppError(404, "Branch not found");
  }

  if (organizationId && !branch.organizationId.equals(asObjectId(organizationId))) {
    throw new AppError(403, "Branch is outside the selected organization");
  }

  return branch;
};

const assertEmployeeAccess = (actor: IUser, employee: IUser) => {
  if (actor.role === "admin") {
    return;
  }

  if (actor.role === "owner") {
    const sameOrganization =
      actor.organizationId &&
      employee.organizationId &&
      actor.organizationId.equals(employee.organizationId);
    const createdByOwner = employee.createdBy && employee.createdBy.equals(actor._id);

    if (!sameOrganization && !createdByOwner) {
      throw new AppError(403, "Employee is outside your organization");
    }

    return;
  }

  if (employee.role !== "staff") {
    throw new AppError(403, "Managers can only manage staff");
  }

  if (!actor.branchId || !employee.branchId || !actor.branchId.equals(employee.branchId)) {
    throw new AppError(403, "Employee is outside your branch");
  }
};

const assertCreatePermission = async (actor: IUser, payload: CreateEmployeeInput) => {
  if (actor.role === "admin") {
    if (!payload.organizationId) {
      throw new AppError(400, "Organization is required when admin creates employees");
    }

    if (payload.branchId) {
      await assertAdminBranchAccess(payload.organizationId, payload.branchId);
      return asObjectId(payload.branchId);
    }

    if (payload.role === "staff") {
      throw new AppError(400, "Branch is required when creating staff");
    }

    return undefined;
  }

  if (payload.role === "manager" && actor.role !== "owner") {
    throw new AppError(403, "Managers cannot create managers");
  }

  if (actor.role === "manager") {
    if (payload.role !== "staff") {
      throw new AppError(403, "Managers can only create staff");
    }

    if (!actor.branchId) {
      throw new AppError(403, "Manager is not assigned to a branch");
    }

    if (payload.branchId && payload.branchId !== actor.branchId.toString()) {
      throw new AppError(403, "Managers can only create staff in their branch");
    }

    return actor.branchId;
  }

  if (payload.branchId) {
    await assertOwnerBranchAccess(actor, payload.branchId);
    return asObjectId(payload.branchId);
  }

  if (payload.role === "staff") {
    throw new AppError(400, "Branch is required when creating staff");
  }

  return undefined;
};

const createEmployee = async (actorPayload: AuthTokenPayload, payload: CreateEmployeeInput) => {
  const actor = await ensureActor(actorPayload);
  const existingUser = await UserModel.findOne({ email: payload.email });

  if (existingUser) {
    throw new AppError(409, "Email already exists");
  }

  const branchId = await assertCreatePermission(actor, payload);
  const hashedPassword = await hashPassword(payload.password);
  const organizationId =
    actor.role === "admin"
      ? asObjectId(payload.organizationId as string)
      : actor.organizationId ?? (payload.organizationId ? asObjectId(payload.organizationId) : undefined);

  const user = await UserModel.create({
    fullName: payload.fullName,
    email: payload.email,
    password: hashedPassword,
    role: payload.role,
    status: "active",
    createdBy: actor._id,
    ...(payload.phone ? { phone: payload.phone } : {}),
    ...(payload.avatar ? { avatar: payload.avatar } : {}),
    ...(payload.employeeType ? { employeeType: payload.employeeType } : {}),
    ...(branchId ? { branchId } : {}),
    ...(organizationId ? { organizationId } : {}),
    ...(payload.employeeCode ? { employeeCode: payload.employeeCode } : {}),
    ...(payload.joinDate ? { joinDate: payload.joinDate } : {}),
  });

  return toPublicUser(user);
};

const getEmployeeById = async (actorPayload: AuthTokenPayload, employeeId: string) => {
  const actor = await ensureActor(actorPayload);
  const employee = await UserModel.findById(employeeId);

  if (!employee) {
    throw new AppError(404, "Employee not found");
  }

  assertEmployeeAccess(actor, employee);

  return toPublicUser(employee);
};

const getEmployeeList = async (actorPayload: AuthTokenPayload, query: EmployeeListQuery) => {
  const actor = await ensureActor(actorPayload, { allowStaff: true });
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};

  if (actor.role === "admin") {
    if (query.organizationId) {
      filter.organizationId = asObjectId(query.organizationId);
    }
  } else if (actor.role === "owner") {
    Object.assign(filter, getOwnerScopeFilter(actor));
  } else {
    if (!actor.branchId) {
      throw new AppError(403, `${actor.role === "staff" ? "Staff" : "Manager"} is not assigned to a branch`);
    }

    filter.role = "staff";
    filter.branchId = actor.branchId;
  }

  if (query.role) {
    if ((actor.role === "manager" || actor.role === "staff") && query.role !== "staff") {
      throw new AppError(403, `${actor.role === "staff" ? "Staff" : "Managers"} can only list staff`);
    }

    filter.role = query.role;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.branchId) {
    if ((actor.role === "manager" || actor.role === "staff") && query.branchId !== actor.branchId?.toString()) {
      throw new AppError(403, `${actor.role === "staff" ? "Staff" : "Managers"} can only list their branch`);
    }

    if (actor.role === "owner") {
      await assertOwnerBranchAccess(actor, query.branchId);
    } else if (actor.role === "admin") {
      await assertAdminBranchAccess(query.organizationId, query.branchId);
    }

    filter.branchId = asObjectId(query.branchId);
  }

  if (query.search) {
    filter.$or = [
      { fullName: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
      { phone: { $regex: query.search, $options: "i" } },
      { employeeCode: { $regex: query.search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    UserModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    UserModel.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: users.map(toPublicUser),
  };
};

const updateEmployee = async (
  actorPayload: AuthTokenPayload,
  employeeId: string,
  payload: UpdateEmployeeInput
) => {
  const actor = await ensureActor(actorPayload);
  const employee = await UserModel.findById(employeeId);

  if (!employee) {
    throw new AppError(404, "Employee not found");
  }

  assertEmployeeAccess(actor, employee);

  if (actor.role === "manager") {
    if (payload.role && payload.role !== "staff") {
      throw new AppError(403, "Managers cannot change staff role");
    }

    if (payload.branchId && payload.branchId !== actor.branchId?.toString()) {
      throw new AppError(403, "Managers cannot transfer staff to another branch");
    }

    if (payload.organizationId) {
      throw new AppError(403, "Managers cannot change organization");
    }
  }

  if (actor.role === "owner" && payload.branchId) {
    await assertOwnerBranchAccess(actor, payload.branchId);
  } else if (actor.role === "admin" && payload.branchId) {
    await assertAdminBranchAccess(payload.organizationId, payload.branchId);
  }

  if (payload.fullName !== undefined) employee.fullName = payload.fullName;
  if (payload.phone !== undefined) employee.phone = payload.phone;
  if (payload.avatar !== undefined) employee.avatar = payload.avatar;
  if (payload.role !== undefined) employee.role = payload.role as UserRole;
  if (payload.employeeType !== undefined) employee.employeeType = payload.employeeType;
  if (payload.branchId !== undefined) employee.branchId = asObjectId(payload.branchId);
  if (payload.organizationId !== undefined) employee.organizationId = asObjectId(payload.organizationId);
  if (payload.employeeCode !== undefined) employee.employeeCode = payload.employeeCode;
  if (payload.joinDate !== undefined) employee.joinDate = payload.joinDate;

  await employee.save();

  return toPublicUser(employee);
};

const setEmployeeStatus = async (
  actorPayload: AuthTokenPayload,
  employeeId: string,
  status: "active" | "inactive"
) => {
  const actor = await ensureActor(actorPayload);
  const employee = await UserModel.findById(employeeId);

  if (!employee) {
    throw new AppError(404, "Employee not found");
  }

  assertEmployeeAccess(actor, employee);

  if (employee._id.equals(actor._id)) {
    throw new AppError(400, "You cannot change your own status");
  }

  employee.status = status;
  await employee.save();

  return toPublicUser(employee);
};

const transferEmployeeBranch = async (
  actorPayload: AuthTokenPayload,
  employeeId: string,
  payload: TransferEmployeeBranchInput
) => {
  const actor = await ensureActor(actorPayload);

  if (!["admin", "owner"].includes(actor.role)) {
    throw new AppError(403, "Only owners or admins can transfer employees between branches");
  }

  const employee = await UserModel.findById(employeeId);

  if (!employee) {
    throw new AppError(404, "Employee not found");
  }

  assertEmployeeAccess(actor, employee);

  if (employee.role !== "staff") {
    throw new AppError(400, "Only staff can be transferred between branches");
  }

  if (actor.role === "admin") {
    await assertAdminBranchAccess(employee.organizationId?.toString(), payload.branchId);
  } else {
    await assertOwnerBranchAccess(actor, payload.branchId);
  }

  employee.branchId = asObjectId(payload.branchId);
  await employee.save();

  return toPublicUser(employee);
};

const assignManagerToBranch = async (
  actorPayload: AuthTokenPayload,
  managerId: string,
  payload: ManagerBranchInput
) => {
  const actor = await ensureActor(actorPayload);

  if (!["admin", "owner"].includes(actor.role)) {
    throw new AppError(403, "Only owners or admins can assign managers to branches");
  }

  const manager = await UserModel.findById(managerId);

  if (!manager) {
    throw new AppError(404, "Manager not found");
  }

  assertEmployeeAccess(actor, manager);

  if (manager.role !== "manager") {
    throw new AppError(400, "User is not a manager");
  }

  const branch =
    actor.role === "admin"
      ? await assertAdminBranchAccess(manager.organizationId?.toString(), payload.branchId)
      : await assertOwnerBranchAccess(actor, payload.branchId);

  if (branch.managerId && !branch.managerId.equals(manager._id)) {
    throw new AppError(409, "Branch already has another manager");
  }

  if (manager.branchId && !manager.branchId.equals(branch._id)) {
    await BranchModel.updateOne(
      { _id: manager.branchId, managerId: manager._id },
      { $unset: { managerId: "" } }
    );
  }

  branch.managerId = manager._id;
  await branch.save();

  manager.branchId = branch._id;
  await manager.save();

  return {
    manager: toPublicUser(manager),
    branch: {
      id: branch._id.toString(),
      name: branch.name,
      managerId: branch.managerId?.toString() ?? null,
    },
  };
};

const removeManagerFromBranch = async (
  actorPayload: AuthTokenPayload,
  managerId: string,
  payload: ManagerBranchInput
) => {
  const actor = await ensureActor(actorPayload);

  if (!["admin", "owner"].includes(actor.role)) {
    throw new AppError(403, "Only owners or admins can remove managers from branches");
  }

  const manager = await UserModel.findById(managerId);

  if (!manager) {
    throw new AppError(404, "Manager not found");
  }

  assertEmployeeAccess(actor, manager);

  if (manager.role !== "manager") {
    throw new AppError(400, "User is not a manager");
  }

  const branch =
    actor.role === "admin"
      ? await assertAdminBranchAccess(manager.organizationId?.toString(), payload.branchId)
      : await assertOwnerBranchAccess(actor, payload.branchId);

  if (!branch.managerId || !branch.managerId.equals(manager._id)) {
    throw new AppError(400, "Manager is not assigned to this branch");
  }

  branch.set("managerId", undefined);
  await branch.save();

  if (manager.branchId?.equals(branch._id)) {
    manager.set("branchId", undefined);
    await manager.save();
  }

  return {
    manager: toPublicUser(manager),
    branch: {
      id: branch._id.toString(),
      name: branch.name,
      managerId: null,
    },
  };
};

export const UserService = {
  createEmployee,
  getEmployeeById,
  getEmployeeList,
  updateEmployee,
  activateEmployee: (actor: AuthTokenPayload, employeeId: string) =>
    setEmployeeStatus(actor, employeeId, "active"),
  deactivateEmployee: (actor: AuthTokenPayload, employeeId: string) =>
    setEmployeeStatus(actor, employeeId, "inactive"),
  transferEmployeeBranch,
  assignManagerToBranch,
  removeManagerFromBranch,
};
