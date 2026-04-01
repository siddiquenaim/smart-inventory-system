"use client";

import { DashboardShellLayout } from "@/components/layout/dashboard-shell";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShellLayout>{children}</DashboardShellLayout>;
}
