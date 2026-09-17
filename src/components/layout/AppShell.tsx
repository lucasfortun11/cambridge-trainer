"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { WordCapture } from "@/components/shared/WordCapture";
import type { PlanStatus } from "@/lib/billing";

type AppShellProps = {
  children: ReactNode;
  userName: string | null;
  streak: number;
  xp: number;
  planStatus: PlanStatus;
};

export function AppShell({ children, userName, streak, xp, planStatus }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName}
          streak={streak}
          xp={xp}
          planStatus={planStatus}
        />
        <main className="flex-1 bg-background p-4 lg:p-8">{children}</main>
      </div>
      <WordCapture />
    </div>
  );
}
