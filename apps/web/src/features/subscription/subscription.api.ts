import { api } from "@/shared/api";
import type {
  Subscription,
  SubscriptionLimitsCheck,
  SubscriptionPlanListQuery,
  SubscriptionPlanListResponse,
} from "./subscription.types";

export const subscriptionApi = {
  current: (organizationId?: string) =>
    api.get<Subscription>("/subscriptions/current", organizationId ? { organizationId } : undefined),
  limits: (organizationId?: string) =>
    api.get<SubscriptionLimitsCheck>("/subscriptions/limits", organizationId ? { organizationId } : undefined),
  plans: (query?: SubscriptionPlanListQuery) =>
    api.get<SubscriptionPlanListResponse>("/subscriptions/plans", query),
};
