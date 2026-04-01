"use client";

import { motion } from "framer-motion";
import { Activity, Boxes, PackageCheck, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const metricCards = [
  {
    title: "Tracked products",
    value: "124",
    note: "Placeholder count for initial dashboard validation.",
    icon: Boxes,
  },
  {
    title: "Active orders",
    value: "08",
    note: "Confirms card layout, spacing, and visual hierarchy.",
    icon: ShoppingCart,
  },
  {
    title: "Stock accuracy",
    value: "98.4%",
    note: "Temporary metric block before real reporting logic exists.",
    icon: PackageCheck,
  },
];

type DashboardShellProps = {
  user: {
    email?: string | null;
    name?: string | null;
  };
};

export function DashboardShell({ user }: DashboardShellProps) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl px-6 py-14 sm:px-8 lg:px-10">
      <div className="w-full space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-col gap-5 rounded-[2rem] border border-border/70 bg-card/75 p-7 backdrop-blur-sm sm:p-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/8 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary"
              >
                Dashboard Shell
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                  {user.name
                    ? `Welcome back, ${user.name}`
                    : "Dashboard preview"}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  This page verifies the authenticated dashboard layout, session
                  rendering, sign-out control, and metric card structure before
                  real inventory features are added.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
              <p className="text-sm text-muted-foreground">Session status</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                Authenticated
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="mt-2 truncate text-base font-medium text-foreground">
                {user.email ?? "No active user session"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
              <p className="text-sm text-muted-foreground">Activity feed</p>
              <div className="mt-2 flex items-center gap-2 text-base font-medium text-foreground">
                <Activity className="size-4 text-primary" />
                Placeholder enabled
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-5 lg:grid-cols-3">
          {metricCards.map(({ title, value, note, icon: Icon }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.1 + index * 0.08,
                ease: "easeOut",
              }}
            >
              <Card className="h-full border border-white/50 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base tracking-[-0.02em]">
                        {title}
                      </CardTitle>
                      <CardDescription>{note}</CardDescription>
                    </div>
                    <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                      <Icon className="size-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
                    {value}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
