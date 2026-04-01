"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Activity,
  Layers,
  LayoutDashboard,
  ListChecks,
  LogOut,
  ShoppingCart,
  SquareStack,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Image from "next/image";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Categories", href: "/categories", icon: Layers },
  { label: "Products", href: "/products", icon: SquareStack },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Restock Queue", href: "/restock-queue", icon: ListChecks },
  { label: "Activity Logs", href: "/activity-logs", icon: Activity },
];

export function DashboardShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col bg-background">
      <div className="container mx-auto flex flex-1 flex-col gap-6 px-4 py-6 md:flex-row md:gap-8 lg:px-6">
        <nav className="sticky top-6 hidden w-64 h-[calc(100vh-40px)] rounded-3xl border border-border/80 bg-card/70 p-4 text-sm shadow-sm md:flex">
          <div className="flex h-full w-full flex-col gap-4">
            <Image
              alt="logo"
              src="https://i.ibb.co.com/Ps5BhJ63/smart-inv.png"
              width={72}
              height={72}
              className="mx-auto mb-6"
            />
            <div className="space-y-1 flex flex-1 flex-col justify-start">
              {navItems.map(({ label, href, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2 transition ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                );
              })}
            </div>
            <div>
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="size-4" />
                Logout
              </Button>
            </div>
          </div>
        </nav>
        <section className="flex-1 space-y-6">{children}</section>
      </div>
    </div>
  );
}
