import { AppShell } from "@/components/layout/app-shell";
import { TopBar } from "@/components/layout/top-bar";
import { TrialBanner } from "@/components/layout/trial-status";
import { getWorkspace } from "@/features/workspace/get-workspace";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const workspace = await getWorkspace();

  return (
    <AppShell workspace={workspace} topBar={<TopBar workspace={workspace} />}>
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-4 pt-5 pb-12 sm:px-6 lg:px-8">
        <TrialBanner trial={workspace.trial} />
        {children}
      </div>
    </AppShell>
  );
}
