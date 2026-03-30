import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardShellLayout } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShellLayout>
      <DashboardHeader />
      {children}
    </DashboardShellLayout>
  );
}
