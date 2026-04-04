"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function DashboardHeader() {
  return (
    <div className="flex items-center gap-3 rounded-3xl border border-border/70 bg-card/80 p-4 shadow-sm sm:p-6">
      <SidebarTrigger className="shrink-0 md:hidden" />
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="text-2xl font-semibold text-foreground">
          Smart inventory
        </h1>
      </div>
    </div>
  );
}
