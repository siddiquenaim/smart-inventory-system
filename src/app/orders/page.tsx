"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: string | number;
  userId: string;
  userName: string | null;
  createdAt: string;
  updatedAt: string;
};

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const getResponseError = async (response: Response) => {
  const payload = await response.json().catch(() => null);
  return payload?.error ?? response.statusText ?? "Unable to complete request.";
};

const formatCurrency = (value: string | number) => {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numberValue)) {
    return "$0.00";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numberValue);
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString();
};

const statusVariant = (status: OrderStatus) => {
  if (status === "delivered") return "default" as const;
  if (status === "confirmed" || status === "shipped") return "secondary" as const;
  if (status === "cancelled") return "destructive" as const;
  return "outline" as const;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const query = params.toString();
    return query ? `?${query}` : "";
  }, [dateFrom, dateTo, statusFilter]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders${queryString}`);
      if (!response.ok) {
        setError(await getResponseError(response));
        setOrders([]);
        return;
      }
      const payload = (await response.json()) as OrderRow[];
      setOrders(payload);
    } catch (fetchError) {
      setOrders([]);
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return (
    <main className="space-y-6 pb-8">
      <Card className="border border-border/70 bg-card/80">
        <CardHeader>
          <div>
            <CardTitle className="text-2xl">Orders</CardTitle>
            <CardDescription>
              Review orders by status/date and open details to manage each order.
            </CardDescription>
          </div>
          <CardAction className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs uppercase tracking-[0.3em]">
              {orders.length} shown
            </Badge>
            <Button asChild className="rounded-full">
              <Link href="/orders/create">
                <Plus className="size-4" />
                Create order
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="order-date-from">Date from</Label>
              <Input
                id="order-date-from"
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="order-date-to">Date to</Label>
              <Input
                id="order-date-to"
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Card className="border border-border/80 bg-card/70">
        <CardContent className="px-0">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton className="h-4 w-36 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36 rounded" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-24 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No orders found for current filters.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="space-y-1">
                      <div className="font-medium text-foreground">{order.orderNumber}</div>
                      <p className="text-xs text-muted-foreground">{order.id}</p>
                    </TableCell>
                    <TableCell>{order.userName ?? "Unknown user"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="size-4" />
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
