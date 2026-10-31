import { DEMO_NOW } from "@/config/app";
import { demoMembers } from "@/mocks/agency";
import { demoDailyActivity, MONTHLY_SALES_TARGET_PKR } from "@/mocks/activity";
import { demoDeals, pipelineStages } from "@/mocks/deals";
import { leadSources, leadSourceWeights } from "@/mocks/lead-sources";
import { demoLeads } from "@/mocks/leads";
import { demoProperties } from "@/mocks/properties";
import { demoSchedule } from "@/mocks/schedule";
import { agentLeaderboard, monthlySales, summarizeInventory, summarizePipeline } from "../lib/metrics";
import type { MemberRef } from "@/features/workspace/types";
import type { DashboardData } from "./types";

/**
 * Dashboard read model for one agency. Every collection is filtered by `agencyId` here, mirroring
 * the tenant scoping the Prisma-backed implementation must enforce on the server.
 */
export async function getDashboardData(agencyId: string, currentUserId: string): Promise<DashboardData> {
  const members = demoMembers.filter((m) => m.agencyId === agencyId);
  const deals = demoDeals.filter((d) => d.agencyId === agencyId);
  const properties = demoProperties.filter((p) => p.agencyId === agencyId);

  const memberRef = (id: string | null): MemberRef | null => {
    const member = id ? members.find((m) => m.id === id) : undefined;
    return member ? { id: member.id, name: member.name } : null;
  };
  const nowMs = new Date(DEMO_NOW).getTime();
  const horizonMs = nowMs + 48 * 3_600_000;

  return {
    now: DEMO_NOW,
    greetingName: (members.find((m) => m.id === currentUserId)?.name ?? "").split(" ")[0] ?? "",
    activity: demoDailyActivity,
    listingDates: properties.map((p) => p.listedAt),
    inventory: summarizeInventory(properties),
    pipeline: summarizePipeline(deals, pipelineStages),
    monthlySales: monthlySales(demoDailyActivity, MONTHLY_SALES_TARGET_PKR),
    monthlyTargetPKR: MONTHLY_SALES_TARGET_PKR,
    leaderboard: agentLeaderboard(members, deals),
    schedule: demoSchedule
      .filter((s) => {
        const startsMs = new Date(s.startsAt).getTime();
        return s.agencyId === agencyId && !s.completedAt && startsMs >= nowMs && startsMs <= horizonMs;
      })
      .map((s) => ({ ...s, assignedTo: memberRef(s.assignedToId) })),
    recentLeads: demoLeads
      .filter((l) => l.agencyId === agencyId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10)
      .map((l) => ({
        ...l,
        assignedTo: memberRef(l.assignedToId),
        sourceLabel: leadSources.find((s) => s.id === l.sourceId)?.label ?? "Other",
      })),
    leadSources,
    leadSourceWeights,
  };
}
