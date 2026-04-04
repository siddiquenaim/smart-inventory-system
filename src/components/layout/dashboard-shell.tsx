"use client";

import Image from "next/image";
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Categories", href: "/categories", icon: Layers },
  { label: "Products", href: "/products", icon: SquareStack },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Restock Queue", href: "/restock-queue", icon: ListChecks },
  { label: "Activity Logs", href: "/activity-logs", icon: Activity },
];

const getPageTitle = (pathname: string) => {
  const activeItem = navItems.find((item) =>
    pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return activeItem?.label ?? "Smart Inventory";
};

export function DashboardShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar
          variant="inset"
          collapsible="offcanvas"
          className="border-r-0 md:p-4"
        >
          <SidebarHeader className="gap-4 px-4 pt-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-center rounded-3xl border border-border/70 bg-card/80 px-4 py-6"
            >
              <Image
                alt="logo"
                src="https://i.ibb.co.com/Ps5BhJ63/smart-inv.png"
                width={72}
                height={72}
                className="mx-auto"
              />
            </Link>
          </SidebarHeader>

          <SidebarContent className="px-3 py-2">
            <SidebarMenu>
              {navItems.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    className="rounded-2xl"
                    tooltip={label}
                  >
                    <Link href={href}>
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="px-3 pb-4">
            <Button
              variant="outline"
              className="w-full rounded-full justify-center"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="bg-background">
          <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between px-1 md:hidden">
              <Link href="/dashboard" className="inline-flex items-center">
                <Image
                  alt="logo"
                  src="https://i.ibb.co.com/Ps5BhJ63/smart-inv.png"
                  width={44}
                  height={44}
                  className="h-11 w-11"
                />
              </Link>
              <SidebarTrigger className="size-10 p-0 [&_svg]:size-6" />
            </div>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
