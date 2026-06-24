import type { AuthUser } from "@/store";

const GA_MEASUREMENT_ID = "G-BEF62GKDE0";

type GtagCommand = "config" | "event";
type Gtag = (command: GtagCommand, target: string, params?: Record<string, unknown>) => void;

const getGtag = (): Gtag | undefined => {
  if (typeof window === "undefined") return undefined;

  return (window as Window & { gtag?: Gtag }).gtag;
};

export const identifyAnalyticsUser = (user: AuthUser) => {
  getGtag()?.("config", GA_MEASUREMENT_ID, {
    user_id: user.id,
  });
};

export const clearAnalyticsUser = () => {
  getGtag()?.("config", GA_MEASUREMENT_ID, {
    user_id: null,
  });
};

export const trackLogin = (user: AuthUser) => {
  identifyAnalyticsUser(user);

  getGtag()?.("event", "login", {
    method: "password",
    user_role: user.role,
    organization_id: user.organizationId,
    branch_id: user.branchId,
  });
};
