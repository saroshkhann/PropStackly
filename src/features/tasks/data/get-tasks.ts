import { DEMO_NOW } from "@/config/app";
import { getLeadPeeks } from "@/features/leads/data/lead-peeks";
import { createMemberResolver, getTeamOptions } from "@/features/workspace/members";
import { demoTasks } from "@/mocks/tasks";
import type { TasksPageData } from "./types";

/** Task read model, scoped by `agencyId`. */
export async function getTasksPageData(agencyId: string, currentUserId: string): Promise<TasksPageData> {
  const resolveMember = createMemberResolver(agencyId);
  const leads = getLeadPeeks(agencyId);
  const leadById = new Map(leads.map((lead) => [lead.id, lead]));
  return {
    now: DEMO_NOW,
    currentUserId,
    tasks: demoTasks
      .filter((task) => task.agencyId === agencyId)
      .map((task) => ({
        ...task,
        assignee: resolveMember(task.assignedToId),
        lead: task.leadId ? (leadById.get(task.leadId) ?? null) : null,
      })),
    agents: getTeamOptions(agencyId),
    leads,
  };
}
