import type { Metadata } from "next";
import { TasksView } from "@/features/tasks/components/tasks-view";
import { getTasksPageData } from "@/features/tasks/data/get-tasks";
import { getWorkspace } from "@/features/workspace/get-workspace";

export const metadata: Metadata = { title: "Tasks & follow-ups" };

export default async function TasksPage() {
  const workspace = await getWorkspace();
  const data = await getTasksPageData(workspace.agency.id, workspace.currentUser.id);
  return <TasksView data={data} />;
}
