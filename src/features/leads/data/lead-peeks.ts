import { createMemberResolver } from "@/features/workspace/members";
import { demoLeads } from "@/mocks/leads";
import type { LeadPeekData } from "../components/lead-peek";

export function getLeadPeeks(agencyId: string): LeadPeekData[] {
  const resolveMember = createMemberResolver(agencyId);
  return demoLeads
    .filter((lead) => lead.agencyId === agencyId)
    .map((lead) => ({
      id: lead.id,
      name: lead.name,
      status: lead.status,
      priority: lead.priority,
      interest: lead.interest,
      location: lead.location,
      phoneMasked: lead.phoneMasked,
      agentName: resolveMember(lead.assignedToId)?.name ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
