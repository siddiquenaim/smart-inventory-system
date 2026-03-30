import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardShell user={session.user} />;
}
