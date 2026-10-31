/** Every agency-owned record carries its tenant id. Server code must scope every read and write by it. */
export interface TenantScoped {
  agencyId: string;
}

export type PlatformRole = "super_admin";
export type AgencyRole = "owner" | "manager" | "agent";

export const AGENCY_ROLE_LABELS: Record<AgencyRole, string> = {
  owner: "Agency owner",
  manager: "Manager",
  agent: "Agent",
};
