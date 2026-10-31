import { Separator } from "@/components/ui/separator";
import { DemoBadge } from "@/components/shared/demo-badge";
import type { WorkspaceContext } from "@/features/workspace/types";
import { AgencySwitcher } from "./agency-switcher";
import { CommandSearch } from "./command-search";
import { MobileNav } from "./mobile-nav";
import { NotificationsMenu } from "./notifications-menu";
import { QuickAdd } from "./quick-add";
import { UserMenu } from "./user-menu";

export function TopBar({ workspace }: { workspace: WorkspaceContext }) {
  const planLabel = workspace.trial.state === "trialing" ? "Free trial" : "Trial ended";

  return (
    <header className="sticky top-0 z-30 border-b bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/75">
      <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <MobileNav badges={workspace.navBadges} trial={workspace.trial} />
        <AgencySwitcher agency={workspace.agency} planLabel={planLabel} />
        <Separator orientation="vertical" className="mx-1 h-6! max-md:hidden" />
        <div className="flex min-w-0 flex-1 items-center justify-end md:justify-start">
          <CommandSearch />
        </div>
        <DemoBadge className="max-xl:hidden" label="Demo workspace" />
        <QuickAdd />
        <NotificationsMenu notifications={workspace.notifications} now={workspace.now} />
        <Separator orientation="vertical" className="h-6! max-sm:hidden" />
        <UserMenu user={workspace.currentUser} />
      </div>
    </header>
  );
}
