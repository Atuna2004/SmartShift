import { Types } from "mongoose";
import { AppError } from "../../common/errors/AppError.js";
import type { AuthTokenPayload } from "../../common/utils/jwt.js";
import { UserModel } from "../user/user.model.js";
import type { IUser } from "../user/user.model.js";
import { OrganizationModel } from "./organization.model.js";
import type {
  IOrganization,
  OrganizationSettings,
  OrganizationSubscriptionInfo,
} from "./organization.model.js";
import type {
  ConfigureOrganizationSettingsInput,
  ConfigureOrganizationSubscriptionInput,
  CreateOrganizationInput,
  UpdateOrganizationProfileInput,
} from "./organization.validation.js";

const getDocumentId = (document: { _id: unknown }) => document._id as Types.ObjectId;

const ensureOwnerOrAdmin = async (actor: AuthTokenPayload) => {
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
    throw new AppError(403, "Only owners or admins can manage organization");
  }

  return user;
};

const assertOrganizationAccess = (actor: IUser, organization: IOrganization) => {
  if (actor.role === "admin") {
    return;
  }

  const ownsOrganization = organization.ownerId.equals(getDocumentId(actor));
  const sameOrganization =
    actor.organizationId && actor.organizationId.equals(getDocumentId(organization));

  if (!ownsOrganization && !sameOrganization) {
    throw new AppError(403, "Organization is outside your scope");
  }
};

const resolveOrganization = async (actor: IUser, organizationId?: string) => {
  let organization: IOrganization | null = null;

  if (organizationId) {
    organization = await OrganizationModel.findById(organizationId);
  } else if (actor.organizationId) {
    organization = await OrganizationModel.findById(actor.organizationId);
  } else {
    organization = await OrganizationModel.findOne({
      ownerId: getDocumentId(actor),
      deletedAt: { $exists: false },
    }).sort({ createdAt: -1 });
  }

  if (!organization || organization.deletedAt) {
    throw new AppError(404, "Organization not found");
  }

  assertOrganizationAccess(actor, organization);

  return organization;
};

const assertUniqueSlug = async (
  slug: string | undefined,
  excludeOrganizationId?: Types.ObjectId
) => {
  if (!slug) {
    return;
  }

  const filter: Record<string, unknown> = {
    slug,
    deletedAt: { $exists: false },
  };

  if (excludeOrganizationId) {
    filter._id = { $ne: excludeOrganizationId };
  }

  const existingOrganization = await OrganizationModel.findOne(filter);

  if (existingOrganization) {
    throw new AppError(409, "Organization slug already exists");
  }
};

const toPublicOrganization = (organization: IOrganization) => ({
  id: getDocumentId(organization).toString(),
  name: organization.name,
  status: organization.status,
  settings: organization.settings,
  subscription: organization.subscription,
  ownerId: organization.ownerId.toString(),
  createdBy: organization.createdBy.toString(),
  ...(organization.slug ? { slug: organization.slug } : {}),
  ...(organization.businessType
    ? { businessType: organization.businessType }
    : {}),
  ...(organization.phone ? { phone: organization.phone } : {}),
  ...(organization.email ? { email: organization.email } : {}),
  ...(organization.address ? { address: organization.address } : {}),
  ...(organization.logo ? { logo: organization.logo } : {}),
  ...(organization.subscriptionId
    ? { subscriptionId: organization.subscriptionId.toString() }
    : {}),
  ...(organization.updatedBy ? { updatedBy: organization.updatedBy.toString() } : {}),
  ...(organization.disabledAt ? { disabledAt: organization.disabledAt } : {}),
  ...(organization.enabledAt ? { enabledAt: organization.enabledAt } : {}),
});

const createOrganization = async (
  actorPayload: AuthTokenPayload,
  payload: CreateOrganizationInput
) => {
  const actor = await ensureOwnerOrAdmin(actorPayload);

  if (actor.role === "admin") {
    throw new AppError(400, "Admin cannot create tenant organization directly");
  }

  await assertUniqueSlug(payload.slug);

  const organization = await OrganizationModel.create({
    name: payload.name,
    ownerId: getDocumentId(actor),
    createdBy: getDocumentId(actor),
    status: "active",
    ...(payload.slug ? { slug: payload.slug } : {}),
    ...(payload.businessType ? { businessType: payload.businessType } : {}),
    ...(payload.phone ? { phone: payload.phone } : {}),
    ...(payload.email ? { email: payload.email } : {}),
    ...(payload.address ? { address: payload.address } : {}),
    ...(payload.logo ? { logo: payload.logo } : {}),
  });

  if (!actor.organizationId) {
    actor.organizationId = getDocumentId(organization);
    await actor.save();
  }

  return toPublicOrganization(organization);
};

const getMyOrganization = async (
  actorPayload: AuthTokenPayload,
  organizationId?: string
) => {
  const actor = await ensureOwnerOrAdmin(actorPayload);
  const organization = await resolveOrganization(actor, organizationId);

  return toPublicOrganization(organization);
};

const updateOrganizationProfile = async (
  actorPayload: AuthTokenPayload,
  payload: UpdateOrganizationProfileInput,
  organizationId?: string
) => {
  const actor = await ensureOwnerOrAdmin(actorPayload);
  const organization = await resolveOrganization(actor, organizationId);

  await assertUniqueSlug(payload.slug, getDocumentId(organization));

  if (payload.name !== undefined) organization.name = payload.name;
  if (payload.slug !== undefined) organization.slug = payload.slug;
  if (payload.businessType !== undefined) {
    organization.businessType = payload.businessType;
  }
  if (payload.phone !== undefined) organization.phone = payload.phone;
  if (payload.email !== undefined) organization.email = payload.email;
  if (payload.address !== undefined) organization.address = payload.address;
  if (payload.logo !== undefined) organization.logo = payload.logo;

  organization.updatedBy = getDocumentId(actor);
  await organization.save();

  return toPublicOrganization(organization);
};

const configureOrganizationSettings = async (
  actorPayload: AuthTokenPayload,
  payload: ConfigureOrganizationSettingsInput,
  organizationId?: string
) => {
  const actor = await ensureOwnerOrAdmin(actorPayload);
  const organization = await resolveOrganization(actor, organizationId);

  organization.settings = {
    ...organization.settings,
    ...payload,
  } as OrganizationSettings;
  organization.updatedBy = getDocumentId(actor);
  await organization.save();

  return toPublicOrganization(organization);
};

const configureSubscriptionInfo = async (
  actorPayload: AuthTokenPayload,
  payload: ConfigureOrganizationSubscriptionInput,
  organizationId?: string
) => {
  const actor = await ensureOwnerOrAdmin(actorPayload);
  const organization = await resolveOrganization(actor, organizationId);

  organization.subscription = {
    ...organization.subscription,
    ...payload,
  } as OrganizationSubscriptionInfo;
  organization.updatedBy = getDocumentId(actor);
  await organization.save();

  return toPublicOrganization(organization);
};

const setOrganizationStatus = async (
  actorPayload: AuthTokenPayload,
  organizationId: string,
  status: "active" | "disabled"
) => {
  const actor = await ensureOwnerOrAdmin(actorPayload);
  const organization = await resolveOrganization(actor, organizationId);
  const now = new Date();

  organization.status = status;
  organization.updatedBy = getDocumentId(actor);

  if (status === "disabled") {
    organization.disabledAt = now;
  } else {
    organization.enabledAt = now;
    organization.set("disabledAt", undefined);
  }

  await organization.save();

  return toPublicOrganization(organization);
};

export const OrganizationService = {
  createOrganization,
  getMyOrganization,
  updateOrganizationProfile,
  configureOrganizationSettings,
  configureSubscriptionInfo,
  disableOrganization: (actor: AuthTokenPayload, organizationId: string) =>
    setOrganizationStatus(actor, organizationId, "disabled"),
  enableOrganization: (actor: AuthTokenPayload, organizationId: string) =>
    setOrganizationStatus(actor, organizationId, "active"),
};
