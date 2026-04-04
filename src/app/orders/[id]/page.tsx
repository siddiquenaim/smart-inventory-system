"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const ORDER_STATUS_OPTIONS: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

type OrderItemDetail = {
  id: string;
  productId: string;
  productName: string | null;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
};

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: string | number;
  userId: string;
  userName: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDetail[];
};

const getResponseError = async (response: Response) => {
  const payload = await response.json().catch(() => null);
  return payload?.error ?? response.statusText ?? "Unable to complete request.";
};

const formatCurrency = (value: string | number) => {
  const numberValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numberValue)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numberValue);
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const statusVariant = (status: OrderStatus) => {
  if (status === "delivered") return "default" as const;
  if (status === "confirmed" || status === "shipped") return "secondary" as const;
  if (status === "cancelled") return "destructive" as const;
  return "outline" as const;
};

const allowedTransitions = (status: OrderStatus): OrderStatus[] => {
  if (status === "pending") return ["confirmed", "cancelled"];
  if (status === "confirmed") return ["shipped", "delivered", "cancelled"];
  if (status === "shipped") return ["delivered"];
  return [];
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        setError(await getResponseError(response));
        setDetail(null);
        return;
      }
      const payload = (await response.json()) as OrderDetail;
      setDetail(payload);
      setNextStatus("");
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load order details.");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void fetchOrderDetail();
  }, [fetchOrderDetail]);

  const transitionOptions = useMemo(
    () => (detail ? allowedTransitions(detail.status) : []),
    [detail]
  );

  const updateStatus = async () => {
    if (!orderId || !nextStatus) {
      setError("Select a target status first.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) {
        setError(await getResponseError(response));
        return;
      }
      await fetchOrderDetail();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to update order status.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCurrentOrder = async () => {
    if (!orderId || !detail) {
      return;
    }

    const confirmed = window.confirm(
      `Delete order ${detail.orderNumber}? This restores stock for non-cancelled orders and cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setError(await getResponseError(response));
        return;
      }
      router.push("/orders");
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to delete order.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="space-y-6 pb-8">
      <Card className="border border-border/70 bg-card/80">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">Order Details</CardTitle>
              <CardDescription>Manage this order by updating its status from this page.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/orders">
                  <ArrowLeft className="size-4" />
                  Back to orders
                </Link>
              </Button>
              <Button variant="ghost" className="rounded-full" onClick={() => router.refresh()}>
                Refresh
              </Button>
              <Button
                variant="destructive"
                className="rounded-full"
                onClick={() => void deleteCurrentOrder()}
                disabled={isDeleting}
              >
                <Trash2 className="size-4" />
                {isDeleting ? "Deleting..." : "Delete order"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <Card className="border border-border/80 bg-card/70">
          <CardContent className="space-y-4 py-6">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-36 w-full" />
          </CardContent>
        </Card>
      ) : detail ? (
        <>
          <Card className="border border-border/80 bg-card/70">
            <CardHeader>
              <CardTitle>{detail.orderNumber}</CardTitle>
              <CardDescription>{detail.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Customer</p>
                  <p className="mt-1 text-sm font-medium">{detail.userName ?? "Unknown user"}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <Badge variant={statusVariant(detail.status)}>{detail.status}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Created</p>
                  <p className="mt-1 text-sm font-medium">{formatDateTime(detail.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</p>
                  <p className="mt-1 text-sm font-semibold">{formatCurrency(detail.total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/80 bg-card/70">
            <CardHeader>
              <CardTitle>Manage Status</CardTitle>
              <CardDescription>All order statuses are visible here. Unavailable transitions are disabled.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-64 space-y-1">
                  <Label>Next status</Label>
                  <Select value={nextStatus || undefined} onValueChange={(value) => setNextStatus(value as OrderStatus)} disabled={transitionOptions.length === 0 || isSaving}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status} disabled={status === detail.status || !transitionOptions.includes(status)}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => void updateStatus()} disabled={!nextStatus || isSaving}>
                  {isSaving ? "Saving..." : "Update status"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/80 bg-card/70">
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit price</TableHead>
                    <TableHead>Line total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName ?? item.productId}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell>{formatCurrency(item.lineTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border border-border/80 bg-card/70">
          <CardContent className="py-6 text-sm text-muted-foreground">Order not found.</CardContent>
        </Card>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete order?</DialogTitle>
            <DialogDescription>
              This removes the order permanently and restores stock for non-cancelled orders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              Confirm deletion of <span className="font-semibold text-foreground">{detail?.orderNumber}</span>.
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void deleteCurrentOrder()}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}









