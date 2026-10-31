import type { FollowUpChannel, ScheduleItem } from "@/domain/schedule";
import type { TaskType } from "@/domain/task";
import { demoLeads } from "./leads";
import { demoSiteVisits } from "./site-visits";
import { demoTasks } from "./tasks";

const channelFor: Partial<Record<TaskType, FollowUpChannel>> = { call: "call", whatsapp: "whatsapp", meeting: "meeting", email: "email" };
const leadById = new Map(demoLeads.map((lead) => [lead.id, lead]));

/** Agenda view over lead follow-up tasks and site visits. */
export const demoSchedule: ScheduleItem[] = [
  ...demoTasks
    .filter((task) => task.leadId)
    .map((task): ScheduleItem => ({
      id: task.id,
      agencyId: task.agencyId,
      kind: "follow_up",
      leadId: task.leadId,
      title: task.title,
      leadName: leadById.get(task.leadId!)?.name ?? "",
      location: null,
      channel: channelFor[task.type] ?? null,
      startsAt: task.dueAt,
      assignedToId: task.assignedToId,
      priority: task.priority === "high" ? "high" : "normal",
      completedAt: task.completedAt,
    })),
  ...demoSiteVisits
    .filter((visit) => visit.status !== "cancelled")
    .map((visit): ScheduleItem => ({
      id: visit.id,
      agencyId: visit.agencyId,
      kind: "site_visit",
      leadId: visit.leadId,
      title: visit.title,
      leadName: visit.customerName,
      location: visit.meetingPoint,
      channel: null,
      startsAt: visit.startsAt,
      assignedToId: visit.assignedToId,
      priority: visit.priority,
      completedAt: visit.status === "completed" || visit.status === "no_show" ? visit.startsAt : null,
    })),
].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
