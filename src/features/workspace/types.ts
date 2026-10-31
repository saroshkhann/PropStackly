import type { NavBadgeKey } from "@/config/navigation";
import type { Agency, AgencyMember } from "@/domain/agency";
import type { AppNotification } from "@/domain/notification";
import type { TrialStatus } from "@/domain/subscription";

export interface WorkspaceContext {
  agency: Agency;
  currentUser: AgencyMember;
  trial: TrialStatus;
  notifications: AppNotification[];
  navBadges: Partial<Record<NavBadgeKey, number>>;
  now: string;
}

export interface MemberRef {
  id: string;
  name: string;
}

export interface AgentOption extends MemberRef {
  title: string;
  openLeads: number;
}
