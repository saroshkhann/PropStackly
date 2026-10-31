import type { AgencyRole, TenantScoped } from "./tenancy";

export interface Agency {
  id: string;
  name: string;
  slug: string;
  city: string;
  timezone: string;
  createdAt: string;
}

export interface AgencyMember extends TenantScoped {
  id: string;
  name: string;
  email: string;
  role: AgencyRole;
  title: string;
  branch: string;
  monthlyTargetPKR: number;
}
