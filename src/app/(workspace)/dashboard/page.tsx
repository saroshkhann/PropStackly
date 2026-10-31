import type { Metadata } from "next";
import { DashboardView } from "@/features/dashboard/components/dashboard-view";
import { getDashboardData } from "@/features/dashboard/data/get-dashboard-data";
import { getWorkspace } from "@/features/workspace/get-workspace";

export const metadata: Metadata = { title: "Dashboard" };

function greetingFor(iso: string, timeZone: string) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone }).format(new Date(iso)));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const workspace = await getWorkspace();
  const data = await getDashboardData(workspace.agency.id, workspace.currentUser.id);

  return <DashboardView data={data} greeting={greetingFor(workspace.now, workspace.agency.timezone)} />;
}
