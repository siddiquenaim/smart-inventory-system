import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { PublicHome } from "./public-home";
import { authOptions } from "@/lib/auth";

export default async function PublicPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard");
  }
  return <PublicHome />;
}
