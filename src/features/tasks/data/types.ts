import type { Task } from "@/domain/task";
import type { LeadPeekData } from "@/features/leads/components/lead-peek";
import type { AgentOption, MemberRef } from "@/features/workspace/types";

export interface TaskItem extends Task {
  assignee: MemberRef | null;
  lead: LeadPeekData | null;
  isDraft?: boolean;
  hasLocalEdits?: boolean;
}

export interface TasksPageData {
  now: string;
  currentUserId: string;
  tasks: TaskItem[];
  agents: AgentOption[];
  leads: LeadPeekData[];
}
