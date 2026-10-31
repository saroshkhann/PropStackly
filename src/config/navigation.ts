import {
  Bell,
  Building2,
  CalendarClock,
  ChartColumn,
  Contact,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  Settings,
  ShieldCheck,
  SquareKanban,
  UserCog,
  UsersRound,
  Workflow,
} from "lucide-react";

export type NavBadgeKey = "newLeads" | "tasksDueToday" | "unreadNotifications";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  badge?: NavBadgeKey;
  /** Built in the current batch; everything else renders a planned-module page. */
  available?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Agency performance at a glance", available: true },
    ],
  },
  {
    label: "Sales",
    items: [
      { id: "leads", label: "Leads", href: "/leads", icon: UsersRound, description: "Capture, assign, and qualify inbound leads", badge: "newLeads" },
      { id: "contacts", label: "Contacts", href: "/contacts", icon: Contact, description: "Buyers, sellers, landlords, and tenants" },
      { id: "pipeline", label: "Pipeline", href: "/pipeline", icon: SquareKanban, description: "Track deals from inquiry to bayana and transfer" },
      { id: "tasks", label: "Follow-ups", href: "/tasks", icon: ListChecks, description: "Reminders, tasks, and follow-up cadences", badge: "tasksDueToday" },
      { id: "site-visits", label: "Site visits", href: "/site-visits", icon: CalendarClock, description: "Schedule and log property viewings" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { id: "properties", label: "Properties", href: "/properties", icon: Building2, description: "Listings, owners, pricing, and media" },
    ],
  },
  {
    label: "Team & insights",
    items: [
      { id: "team", label: "Agents & teams", href: "/team", icon: UserCog, description: "Invite agents, manage teams and targets" },
      { id: "reports", label: "Reports", href: "/reports", icon: ChartColumn, description: "Performance reports and exports" },
      { id: "notifications", label: "Notifications", href: "/notifications", icon: Bell, description: "Alerts across your workspace", badge: "unreadNotifications" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { id: "automations", label: "Automations", href: "/automations", icon: Workflow, description: "n8n workflows and integrations" },
      { id: "roles", label: "Roles & permissions", href: "/roles", icon: ShieldCheck, description: "Control what each role can see and do" },
      { id: "billing", label: "Subscription", href: "/billing", icon: CreditCard, description: "Plan, trial, and payment records" },
      { id: "settings", label: "Agency settings", href: "/settings", icon: Settings, description: "Agency profile, branches, and preferences" },
    ],
  },
];

export const allNavItems = navigation.flatMap((group) => group.items);

export const plannedModules = [
  ...allNavItems.filter((item) => !item.available),
  {
    id: "platform",
    label: "Platform admin",
    href: "/platform",
    icon: ShieldCheck,
    description: "Super Admin panel for agencies, trials, subscriptions, and system settings",
  } satisfies NavItem,
];
