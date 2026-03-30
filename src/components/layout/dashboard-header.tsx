"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-card/80 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="text-2xl font-semibold text-foreground">Smart inventory</h1>
        <Badge className="mt-2 inline-flex" variant="outline">
          Live data
        </Badge>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="rounded-full px-3">
          <Search className="size-4" />
          Search
        </Button>
      </div>
    </div>
  );
}
