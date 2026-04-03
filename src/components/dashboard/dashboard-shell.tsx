"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Boxes,
  CircleDollarSign,
  PackageCheck,
  ShoppingCart,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardShellProps = {
  user: {
    email?: string | null;
    name?: string | null;
  };
};

type DashboardInsights = {
  metrics: {
    totalOrdersToday: number;
    pendingOrders: number;
    completedOrders: number;
    lowStockItemsCount: number;
    revenueToday: number;
  };
  productSummary: Array<{
    id: string;
    name: string;
    stockQuantity: number;
    threshold: number;
    state: "Low Stock" | "OK";
  }>;
};

const metricCardConfig = [
  {
    key: "totalOrdersToday",
    title: "Total Orders Today",
    note: "Orders created since the start of today.",
    icon: ShoppingCart,
  },
  {
    key: "pendingOrders",
    title: "Pending Orders",
    note: "Orders still waiting for confirmation or fulfillment.",
    icon: Boxes,
  },
  {
    key: "completedOrders",
    title: "Completed Orders",
    note: "Delivered orders only.",
    icon: PackageCheck,
  },
  {
    key: "lowStockItemsCount",
    title: "Low Stock Items",
    note: "Products currently below threshold.",
    icon: AlertCircle,
  },
] as const;

const getResponseError = async (response: Response) => {
  const payload = await response.json().catch(() => null);
  return payload?.error ?? response.statusText ?? "Unable to load dashboard insights.";
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export function DashboardShell({ user }: DashboardShellProps) {
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/dashboard/insights");
        if (!response.ok) {
          throw new Error(await getResponseError(response));
        }

        const payload = (await response.json()) as DashboardInsights;
        if (active) {
          setInsights(payload);
        }
      } catch (fetchError) {
        if (active) {
          setInsights(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to load dashboard insights."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInsights();

    return () => {
      active = false;
    };
  }, []);

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
                Operations Overview
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
                  {user.name ? `Welcome back, ${user.name}` : "Dashboard"}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Monitor today&apos;s order flow, track low-stock pressure, and keep the most
                  critical product levels visible from one place.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
              <p className="text-sm text-muted-foreground">Signed in as</p>
              <p className="mt-2 truncate text-base font-medium text-foreground">
                {user.email ?? "No active user session"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
              <p className="text-sm text-muted-foreground">Revenue Today</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-foreground">
                {loading || !insights ? <Skeleton className="h-8 w-28 rounded" /> : formatCurrency(insights.metrics.revenueToday)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-5">
              <p className="text-sm text-muted-foreground">Pending vs Completed</p>
              <div className="mt-2 flex items-center gap-2 text-base font-medium text-foreground">
                {loading || !insights ? (
                  <Skeleton className="h-6 w-40 rounded" />
                ) : (
                  <>
                    <Badge variant="outline">{insights.metrics.pendingOrders} pending</Badge>
                    <Badge variant="secondary">
                      {insights.metrics.completedOrders} completed
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {error ? (
          <div className="rounded-2xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-4">
          {metricCardConfig.map(({ key, title, note, icon: Icon }, index) => {
            const value = insights?.metrics[key] ?? 0;

            return (
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
                        <CardTitle className="text-base tracking-[-0.02em]">{title}</CardTitle>
                        <CardDescription>{note}</CardDescription>
                      </div>
                      <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                        <Icon className="size-4" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Skeleton className="h-9 w-20 rounded" />
                    ) : (
                      <p className="text-3xl font-semibold tracking-[-0.04em] text-foreground">
                        {value}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.22, ease: "easeOut" }}
        >
          <Card className="border border-white/50 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg tracking-[-0.03em]">Product Summary</CardTitle>
                  <CardDescription>
                    Critical product inventory snapshots with clear stock state.
                  </CardDescription>
                </div>
                <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                  <CircleDollarSign className="size-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`summary-skeleton-${index}`}
                    className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3"
                  >
                    <Skeleton className="h-5 w-40 rounded" />
                    <Skeleton className="h-5 w-24 rounded" />
                  </div>
                ))
              ) : insights && insights.productSummary.length > 0 ? (
                insights.productSummary.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Threshold: {product.threshold}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-medium text-foreground">
                        {product.stockQuantity} {product.stockQuantity === 1 ? "left" : "available"}
                      </p>
                      <Badge variant={product.state === "Low Stock" ? "destructive" : "secondary"}>
                        {product.state}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-border/70 bg-background/70 px-4 py-5 text-sm text-muted-foreground">
                  No products available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
