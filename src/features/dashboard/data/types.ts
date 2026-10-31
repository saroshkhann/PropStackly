import type { DailyActivity, MonthlySales } from "@/domain/analytics";
import type { Lead, LeadSource, LeadSourceId } from "@/domain/lead";
import type { ScheduleItem } from "@/domain/schedule";
import type { MemberRef } from "@/features/workspace/types";
import type { AgentPerformance, StageSummary } from "../lib/metrics";

export interface RecentLead extends Lead {
  assignedTo: MemberRef | null;
  sourceLabel: string;
}

export interface ScheduleEntry extends ScheduleItem {
  assignedTo: MemberRef | null;
}

export interface DashboardData {
  now: string;
  greetingName: string;
  activity: DailyActivity[];
  listingDates: string[];
  inventory: { total: number; available: number; underOffer: number };
  pipeline: { stages: StageSummary[]; openCount: number; openValuePKR: number };
  monthlySales: MonthlySales[];
  monthlyTargetPKR: number;
  leaderboard: AgentPerformance[];
  schedule: ScheduleEntry[];
  recentLeads: RecentLead[];
  leadSources: LeadSource[];
  leadSourceWeights: Record<LeadSourceId, number>;
}
