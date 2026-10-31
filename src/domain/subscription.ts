import { TRIAL_DURATION_HOURS } from "@/config/app";
import type { TenantScoped } from "./tenancy";

export type SubscriptionState = "trialing" | "active" | "expired" | "pending_payment";

export interface AgencySubscription extends TenantScoped {
  state: SubscriptionState;
  planName: string | null;
  trialStartedAt: string;
}

export interface TrialStatus {
  state: "trialing" | "expired";
  startedAt: string;
  endsAt: string;
  remainingMs: number;
  fractionUsed: number;
  /** Expired trials keep read-only access until the retention policy applies. */
  readOnly: boolean;
}

const HOUR_MS = 3_600_000;

export function getTrialStatus(subscription: AgencySubscription, now: string): TrialStatus {
  const start = new Date(subscription.trialStartedAt).getTime();
  const end = start + TRIAL_DURATION_HOURS * HOUR_MS;
  const current = new Date(now).getTime();
  const remainingMs = Math.max(0, end - current);
  const expired = remainingMs === 0;

  return {
    state: expired ? "expired" : "trialing",
    startedAt: subscription.trialStartedAt,
    endsAt: new Date(end).toISOString(),
    remainingMs,
    fractionUsed: Math.min(1, Math.max(0, (current - start) / (end - start))),
    readOnly: expired,
  };
}
