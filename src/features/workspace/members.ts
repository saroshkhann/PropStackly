import { OPEN_LEAD_STATUSES } from "@/domain/lead";
import { demoMembers } from "@/mocks/agency";
import { demoLeads } from "@/mocks/leads";
import type { AgentOption, MemberRef } from "./types";

export function getMembers(agencyId: string) {
  return demoMembers.filter((member) => member.agencyId === agencyId);
}

export function createMemberResolver(agencyId: string) {
  const byId = new Map(getMembers(agencyId).map((member) => [member.id, member]));
  return (id: string | null): MemberRef | null => {
    const member = id ? byId.get(id) : undefined;
    return member ? { id: member.id, name: member.name } : null;
  };
}

/** Members who can own leads, with their current open-lead workload. */
export function getAssignableAgents(agencyId: string): AgentOption[] {
  return getMembers(agencyId)
    .filter((member) => member.role !== "owner")
    .map((member) => ({
      id: member.id,
      name: member.name,
      title: member.title,
      openLeads: demoLeads.filter(
        (lead) => lead.agencyId === agencyId && lead.assignedToId === member.id && OPEN_LEAD_STATUSES.includes(lead.status),
      ).length,
    }));
}

/** Everyone in the agency, owners included, for work that isn't lead ownership (tasks, reviews). */
export function getTeamOptions(agencyId: string): AgentOption[] {
  const agents = new Map(getAssignableAgents(agencyId).map((agent) => [agent.id, agent]));
  return getMembers(agencyId).map((member) => agents.get(member.id) ?? { id: member.id, name: member.name, title: member.title, openLeads: 0 });
}
