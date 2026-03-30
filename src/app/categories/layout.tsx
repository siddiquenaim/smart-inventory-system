"use client";

import { DashboardShellLayout } from "@/components/layout/dashboard-shell";

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShellLayout>{children}</DashboardShellLayout>;
}
