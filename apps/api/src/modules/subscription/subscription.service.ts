import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { BranchModel } from "../branch/branch.model.js";
import { OrganizationModel } from "../organization/organization.model.js";
import { ScheduleModel } from "../schedule/schedule.model.js";
import { ShiftTemplateModel } from "../shift/shift-template.model.js";
import { UserModel } from "../user/user.model.js";
import type { IUser } from "../user/user.model.js";
import {
  SubscriptionModel,
  SubscriptionPlanModel,
} from "./subscription.model.js";
import type {
  ISubscription,
  ISubscriptionPlan,
  SubscriptionFeatures,
  SubscriptionLimits,
} from "./subscription.model.js";
import type {
  ChangeSubscriptionPlanInput,
  CheckSubscriptionLimitsQuery,
  CreateSubscriptionPlanInput,
  RenewSubscriptionInput,
  SubscribeOrganizationInput,
  SubscriptionPlanListQuery,
  UpdateSubscriptionPlanInput,
} from "./subscription.validation.js";

const getDocumentId = (document: { _id: unknown }) => document._id as Types.ObjectId;

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const startOfCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const endOfCurrentMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
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

  return user;
};

const assertOwnerOrAdmin = (actor: IUser) => {
  if (!["admin", "owner"].includes(actor.role)) {
    throw new AppError(403, "Only owners or admins can manage subscriptions");
  }
};

const resolveOrganizationId = (actor: IUser, organizationId?: string) => {
  if (organizationId) {
    return new Types.ObjectId(organizationId);
  }

  if (actor.organizationId) {
    return actor.organizationId;
  }

  throw new AppError(400, "Organization is required");
};

const getOrganizationForActor = async (actor: IUser, organizationId?: string) => {
  const resolvedOrganizationId = resolveOrganizationId(actor, organizationId);
  const organization = await OrganizationModel.findById(resolvedOrganizationId);

  if (!organization) {
    throw new AppError(404, "Organization not found");
  }

  if (actor.role === "admin") {
    return organization;
  }

  if (actor.role === "owner") {
    const ownsOrganization = organization.ownerId.equals(getDocumentId(actor));
    const sameOrganization =
      actor.organizationId && actor.organizationId.equals(getDocumentId(organization));

    if (!ownsOrganization && !sameOrganization) {
      throw new AppError(403, "Organization is outside your scope");
    }

    return organization;
  }

  if (!actor.organizationId || !actor.organizationId.equals(getDocumentId(organization))) {
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

const getCurrentSubscriptionForOrganization = async (
  organizationId: Types.ObjectId
) => {
  const subscription = await SubscriptionModel.findOne({
    organizationId,
    status: "active",
    endDate: { $gte: new Date() },
  }).sort({ createdAt: -1 });

  if (!subscription) {
    throw new AppError(404, "Active subscription not found");
  }

  return subscription;
};

const toPublicPlan = (plan: ISubscriptionPlan) => ({
  id: getDocumentId(plan).toString(),
  name: plan.name,
  code: plan.code,
  priceMonthly: plan.priceMonthly,
  currency: plan.currency,
  limits: plan.limits,
  features: plan.features,
  status: plan.status,
  ...(plan.description ? { description: plan.description } : {}),
  ...(plan.createdBy ? { createdBy: plan.createdBy.toString() } : {}),
  ...(plan.updatedBy ? { updatedBy: plan.updatedBy.toString() } : {}),
});

const toPublicSubscription = (subscription: ISubscription) => ({
  id: getDocumentId(subscription).toString(),
  organizationId: subscription.organizationId.toString(),
  ownerId: subscription.ownerId.toString(),
  planId: subscription.planId.toString(),
  planCode: subscription.planCode,
  planName: subscription.planName,
  priceMonthly: subscription.priceMonthly,
  currency: subscription.currency,
  limits: subscription.limits,
  features: subscription.features,
  startDate: subscription.startDate,
  endDate: subscription.endDate,
  status: subscription.status,
  autoRenew: subscription.autoRenew,
  ...(subscription.cancelledAt ? { cancelledAt: subscription.cancelledAt } : {}),
  ...(subscription.renewedAt ? { renewedAt: subscription.renewedAt } : {}),
  ...(subscription.changedAt ? { changedAt: subscription.changedAt } : {}),
});

const snapshotPlan = (plan: ISubscriptionPlan) => ({
  planId: getDocumentId(plan),
  planCode: plan.code,
  planName: plan.name,
  priceMonthly: plan.priceMonthly,
  currency: plan.currency,
  limits: buildLimits(plan.limits),
  features: plan.features,
});

const createSubscriptionPlan = async (
  actorPayload: AuthTokenPayload,
  payload: CreateSubscriptionPlanInput
) => {
  const actor = await ensureActor(actorPayload);
  assertOwnerOrAdmin(actor);

  const existingPlan = await SubscriptionPlanModel.findOne({
    code: payload.code,
    deletedAt: { $exists: false },
  });

  if (existingPlan) {
    throw new AppError(409, "Subscription plan code already exists");
  }

  const plan = await SubscriptionPlanModel.create({
    name: payload.name,
    code: payload.code,
    priceMonthly: payload.priceMonthly,
    currency: payload.currency,
    limits: buildLimits(payload.limits),
    features: payload.features,
    status: "active",
    createdBy: getDocumentId(actor),
    ...(payload.description ? { description: payload.description } : {}),
  });

  return toPublicPlan(plan);
};

const updateSubscriptionPlan = async (
  actorPayload: AuthTokenPayload,
  planId: string,
  payload: UpdateSubscriptionPlanInput
) => {
  const actor = await ensureActor(actorPayload);
  assertOwnerOrAdmin(actor);

  const plan = await SubscriptionPlanModel.findById(planId);

  if (!plan || plan.deletedAt) {
    throw new AppError(404, "Subscription plan not found");
  }

  if (payload.code && payload.code !== plan.code) {
    const existingPlan = await SubscriptionPlanModel.findOne({
      code: payload.code,
      deletedAt: { $exists: false },
      _id: { $ne: getDocumentId(plan) },
    });

    if (existingPlan) {
      throw new AppError(409, "Subscription plan code already exists");
    }
  }

  if (payload.name !== undefined) plan.name = payload.name;
  if (payload.code !== undefined) plan.code = payload.code;
  if (payload.description !== undefined) plan.description = payload.description;
  if (payload.priceMonthly !== undefined) plan.priceMonthly = payload.priceMonthly;
  if (payload.currency !== undefined) plan.currency = payload.currency;
  if (payload.limits !== undefined) {
    plan.limits = buildLimits({
      ...plan.limits,
      ...payload.limits,
    } as SubscriptionLimits);
  }
  if (payload.features !== undefined) {
    plan.features = { ...plan.features, ...payload.features } as SubscriptionFeatures;
  }

  plan.updatedBy = getDocumentId(actor);
  await plan.save();

  return toPublicPlan(plan);
};

const disableSubscriptionPlan = async (
  actorPayload: AuthTokenPayload,
  planId: string
) => {
  const actor = await ensureActor(actorPayload);
  assertOwnerOrAdmin(actor);

  const plan = await SubscriptionPlanModel.findById(planId);

  if (!plan || plan.deletedAt) {
    throw new AppError(404, "Subscription plan not found");
  }

  plan.status = "disabled";
  plan.deletedAt = new Date();
  plan.updatedBy = getDocumentId(actor);
  await plan.save();

  return toPublicPlan(plan);
};

const getSubscriptionPlanList = async (
  actorPayload: AuthTokenPayload,
  query: SubscriptionPlanListQuery
) => {
  await ensureActor(actorPayload);

  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {
    deletedAt: { $exists: false },
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { code: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }

  const [plans, total] = await Promise.all([
    SubscriptionPlanModel.find(filter).sort({ priceMonthly: 1 }).skip(skip).limit(limit),
    SubscriptionPlanModel.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: plans.map(toPublicPlan),
  };
};

const getSubscriptionPlanById = async (
  actorPayload: AuthTokenPayload,
  planId: string
) => {
  await ensureActor(actorPayload);

  const plan = await SubscriptionPlanModel.findById(planId);

  if (!plan || plan.deletedAt) {
    throw new AppError(404, "Subscription plan not found");
  }

  return toPublicPlan(plan);
};

const subscribeOrganizationToPlan = async (
  actorPayload: AuthTokenPayload,
  organizationId: string,
  payload: SubscribeOrganizationInput
) => {
  const actor = await ensureActor(actorPayload);
  assertOwnerOrAdmin(actor);

  const organization = await getOrganizationForActor(actor, organizationId);
  const plan = await getActivePlan(payload.planId);
  const startDate = payload.startDate ?? new Date();
  const endDate = payload.endDate ?? addMonths(startDate, 1);

  await SubscriptionModel.updateMany(
    {
      organizationId: getDocumentId(organization),
      status: "active",
    },
    {
      $set: {
        status: "cancelled",
        cancelledAt: new Date(),
        updatedBy: getDocumentId(actor),
      },
    }
  );

  const subscription = await SubscriptionModel.create({
    organizationId: getDocumentId(organization),
    ownerId: organization.ownerId,
    ...snapshotPlan(plan),
    startDate,
    endDate,
    status: "active",
    autoRenew: payload.autoRenew ?? false,
    createdBy: getDocumentId(actor),
  });

  organization.subscriptionId = getDocumentId(subscription);
  await organization.save();

  return toPublicSubscription(subscription);
};

const getCurrentSubscription = async (
  actorPayload: AuthTokenPayload,
  organizationId?: string
) => {
  const actor = await ensureActor(actorPayload);
  const organization = await getOrganizationForActor(actor, organizationId);
  const subscription = await getCurrentSubscriptionForOrganization(
    getDocumentId(organization)
  );

  return toPublicSubscription(subscription);
};

const changeSubscriptionPlan = async (
  actorPayload: AuthTokenPayload,
  payload: ChangeSubscriptionPlanInput
) => {
  const actor = await ensureActor(actorPayload);
  assertOwnerOrAdmin(actor);

  const organization = await getOrganizationForActor(actor, payload.organizationId);
  const plan = await getActivePlan(payload.planId);
  const subscription = await getCurrentSubscriptionForOrganization(
    getDocumentId(organization)
  );

  subscription.set(snapshotPlan(plan));
  subscription.changedAt = new Date();
  subscription.updatedBy = getDocumentId(actor);
  await subscription.save();

  return toPublicSubscription(subscription);
};

const cancelSubscription = async (
  actorPayload: AuthTokenPayload,
  organizationId?: string
) => {
  const actor = await ensureActor(actorPayload);
  assertOwnerOrAdmin(actor);

  const organization = await getOrganizationForActor(actor, organizationId);
  const subscription = await getCurrentSubscriptionForOrganization(
    getDocumentId(organization)
  );

  subscription.status = "cancelled";
  subscription.cancelledAt = new Date();
  subscription.autoRenew = false;
  subscription.updatedBy = getDocumentId(actor);
  await subscription.save();

  return toPublicSubscription(subscription);
};

const renewSubscription = async (
  actorPayload: AuthTokenPayload,
  payload: RenewSubscriptionInput
) => {
  const actor = await ensureActor(actorPayload);
  assertOwnerOrAdmin(actor);

  const organization = await getOrganizationForActor(actor, payload.organizationId);
  const subscription = await getCurrentSubscriptionForOrganization(
    getDocumentId(organization)
  );
  const renewalBase =
    subscription.endDate > new Date() ? subscription.endDate : new Date();

  subscription.endDate = addMonths(renewalBase, payload.months);
  subscription.renewedAt = new Date();
  subscription.updatedBy = getDocumentId(actor);
  if (payload.autoRenew !== undefined) {
    subscription.autoRenew = payload.autoRenew;
  }
  await subscription.save();

  return toPublicSubscription(subscription);
};

const getSubscriptionUsage = async (organizationId: Types.ObjectId) => {
  const monthStart = startOfCurrentMonth();
  const monthEnd = endOfCurrentMonth();

  const [
    branches,
    employees,
    managers,
    shiftTemplates,
    assignedShiftsThisMonth,
  ] = await Promise.all([
    BranchModel.countDocuments({
      organizationId,
      deletedAt: { $exists: false },
      status: "active",
    }),
    UserModel.countDocuments({
      organizationId,
      role: { $in: ["manager", "staff"] },
      status: "active",
    }),
    UserModel.countDocuments({
      organizationId,
      role: "manager",
      status: "active",
    }),
    ShiftTemplateModel.countDocuments({
      organizationId,
      deletedAt: { $exists: false },
      status: "active",
    }),
    ScheduleModel.countDocuments({
      organizationId,
      deletedAt: { $exists: false },
      workDate: { $gte: monthStart, $lte: monthEnd },
    }),
  ]);

  return {
    branches,
    employees,
    managers,
    shiftTemplates,
    assignedShiftsThisMonth,
  };
};

const compareLimit = (used: number, limit?: number) => ({
  used,
  limit: limit ?? null,
  remaining: limit === undefined ? null : Math.max(limit - used, 0),
  allowed: limit === undefined || used < limit,
});

type LimitsInput = {
  maxBranches: number;
  maxEmployees: number;
  maxManagers: number;
  maxShiftTemplates?: number | undefined;
  maxAssignedShiftsPerMonth?: number | undefined;
};

const buildLimits = (limits: LimitsInput): SubscriptionLimits => ({
  maxBranches: limits.maxBranches,
  maxEmployees: limits.maxEmployees,
  maxManagers: limits.maxManagers,
  ...(limits.maxShiftTemplates !== undefined
    ? { maxShiftTemplates: limits.maxShiftTemplates }
    : {}),
  ...(limits.maxAssignedShiftsPerMonth !== undefined
    ? { maxAssignedShiftsPerMonth: limits.maxAssignedShiftsPerMonth }
    : {}),
});

const checkSubscriptionLimits = async (
  actorPayload: AuthTokenPayload,
  query: CheckSubscriptionLimitsQuery
) => {
  const actor = await ensureActor(actorPayload);
  const organization = await getOrganizationForActor(actor, query.organizationId);
  const subscription = await getCurrentSubscriptionForOrganization(
    getDocumentId(organization)
  );
  const usage = await getSubscriptionUsage(getDocumentId(organization));
  const limits = subscription.limits;
  const featureAllowed =
    query.feature === undefined ? undefined : subscription.features[query.feature];

  return {
    subscription: toPublicSubscription(subscription),
    usage,
    limits: {
      branches: compareLimit(usage.branches, limits.maxBranches),
      employees: compareLimit(usage.employees, limits.maxEmployees),
      managers: compareLimit(usage.managers, limits.maxManagers),
      shiftTemplates: compareLimit(
        usage.shiftTemplates,
        limits.maxShiftTemplates
      ),
      assignedShiftsPerMonth: compareLimit(
        usage.assignedShiftsThisMonth,
        limits.maxAssignedShiftsPerMonth
      ),
    },
    features: subscription.features,
    ...(query.feature ? { feature: query.feature, allowed: featureAllowed } : {}),
  };
};

export const SubscriptionService = {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  disableSubscriptionPlan,
  getSubscriptionPlanList,
  getSubscriptionPlanById,
  subscribeOrganizationToPlan,
  getCurrentSubscription,
  changeSubscriptionPlan,
  cancelSubscription,
  renewSubscription,
  checkSubscriptionLimits,
};
