import { DEMO_NOW } from "@/config/app";
import { getTrialStatus } from "@/domain/subscription";
import { DEMO_CURRENT_USER_ID, demoAgency, demoMembers, demoSubscription } from "@/mocks/agency";
import { demoLeads } from "@/mocks/leads";
import { demoNotifications } from "@/mocks/notifications";
import { demoSchedule } from "@/mocks/schedule";
import { dayKey } from "@/lib/format";
import type { WorkspaceContext } from "./types";

/**
 * Resolves the active agency workspace for the signed-in user.
 * Prototype: returns the demo tenant. The real implementation will read the Better Auth session,
 * verify agency membership on the server, and scope every query by `agency.id`.
 */
export async function getWorkspace(): Promise<WorkspaceContext> {
  const agencyId = demoAgency.id;
  const now = DEMO_NOW;
  const today = dayKey(now);

  const currentUser = demoMembers.find((m) => m.id === DEMO_CURRENT_USER_ID && m.agencyId === agencyId);
  if (!currentUser) throw new Error("Current user is not a member of this agency");

  const notifications = demoNotifications.filter((n) => n.agencyId === agencyId);

  return {
    agency: demoAgency,
    currentUser,
    trial: getTrialStatus(demoSubscription, now),
    notifications,
    navBadges: {
      newLeads: demoLeads.filter((l) => l.agencyId === agencyId && l.status === "new").length,
      tasksDueToday: demoSchedule.filter((s) => s.agencyId === agencyId && dayKey(s.startsAt) === today).length,
      unreadNotifications: notifications.filter((n) => !n.read).length,
    },
    now,
  };
}
