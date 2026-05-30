import { api } from "@/shared/api";
import type { Subscription } from "./subscription.types";

export const subscriptionApi = {
  current: (organizationId?: string) =>
    api.get<Subscription>("/subscriptions/current", organizationId ? { organizationId } : undefined),
};
