"use client";

import { useState } from "react";
import type { WorkspaceContext } from "@/features/workspace/types";
import { AppSidebar } from "./app-sidebar";

interface AppShellProps {
  workspace: WorkspaceContext;
  topBar: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ workspace, topBar, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-dvh">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-card px-3 py-2 text-sm font-medium shadow-raised focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        badges={workspace.navBadges}
        trial={workspace.trial}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        {topBar}
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
