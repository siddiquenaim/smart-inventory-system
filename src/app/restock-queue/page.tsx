"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PackagePlus, Trash2 } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RestockPriority = "high" | "medium" | "low";

type QueueItem = {
  id: string;
  productId: string;
  priority: RestockPriority;
  requestedAt: string;
  note: string;
  productName: string;
  sku: string;
  categoryName: string | null;
  stockQuantity: number;
  threshold: number;
  status: "active" | "out_of_stock";
};

const getResponseError = async (response: Response) => {
  const payload = await response.json().catch(() => null);
  return payload?.error ?? response.statusText ?? "Unable to complete request.";
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
};

const priorityVariant = (priority: RestockPriority) => {
  if (priority === "high") return "destructive" as const;
  if (priority === "medium") return "secondary" as const;
  return "outline" as const;
};

export default function RestockQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restockTarget, setRestockTarget] = useState<QueueItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<QueueItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState("0");
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/restock-queue");
      if (!response.ok) {
        setItems([]);
        setError(await getResponseError(response));
        return;
      }

      const payload = (await response.json()) as QueueItem[];
      setItems(payload);
    } catch (fetchError) {
      setItems([]);
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load restock queue.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQueue();
  }, [fetchQueue]);

  const queueSummary = useMemo(
    () => ({
      total: items.length,
      highPriority: items.filter((item) => item.priority === "high").length,
    }),
    [items]
  );

  const openRestockDialog = (item: QueueItem) => {
    setRestockTarget(item);
    setRestockQuantity(String(Math.max(item.threshold, item.stockQuantity)));
  };

  const submitRestock = async () => {
    if (!restockTarget) {
      return;
    }

    const parsedQuantity = Number(restockQuantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      setError("Stock quantity must be a whole number that is 0 or greater.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/restock-queue/${restockTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: parsedQuantity }),
      });

      if (!response.ok) {
        setError(await getResponseError(response));
        return;
      }

      setRestockTarget(null);
      await fetchQueue();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to restock product.");
    } finally {
      setIsSaving(false);
    }
  };

  const removeQueueItem = async () => {
    if (!removeTarget) {
      return;
    }

    setIsRemoving(true);
    setError(null);
    try {
      const response = await fetch(`/api/restock-queue/${removeTarget.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setError(await getResponseError(response));
        return;
      }

      setRemoveTarget(null);
      await fetchQueue();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove queue item.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <main className="space-y-6 pb-8">
      <Card className="border border-border/70 bg-card/80">
        <CardHeader>
          <div>
            <CardTitle className="text-2xl">Restock Queue</CardTitle>
            <CardDescription>
              Products below threshold are tracked here automatically, sorted by lowest stock first.
            </CardDescription>
          </div>
          <CardAction className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs uppercase tracking-[0.3em]">
              {queueSummary.total} queued
            </Badge>
            <Badge variant={queueSummary.highPriority > 0 ? "destructive" : "secondary"}>
              {queueSummary.highPriority} high priority
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use manual restock to update stock immediately. Items leave this queue automatically once
            stock reaches threshold or above.
          </p>
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
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={`queue-skeleton-${index}`}>
                    <TableCell><Skeleton className="h-4 w-40 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36 rounded" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-36 rounded" /></TableCell>
                  </TableRow>
                ))
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      No products are currently below their stock threshold.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="space-y-1">
                      <div className="font-medium text-foreground">{item.productName}</div>
                      <p className="text-xs text-muted-foreground">
                        {item.sku} • {item.status === "out_of_stock" ? "Out of Stock" : "Active"}
                      </p>
                    </TableCell>
                    <TableCell>{item.categoryName ?? "Unassigned"}</TableCell>
                    <TableCell>
                      <Badge variant={priorityVariant(item.priority)}>
                        {item.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.stockQuantity}</div>
                      <p className="text-xs text-muted-foreground">Threshold: {item.threshold}</p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(item.requestedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => openRestockDialog(item)}
                        >
                          <PackagePlus className="size-4" />
                          Restock
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-destructive"
                          onClick={() => setRemoveTarget(item)}
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(restockTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setRestockTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restock product</DialogTitle>
            <DialogDescription>
              Enter the new stock quantity for {restockTarget?.productName}. The queue will update
              automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="restock-quantity">New stock quantity</Label>
            <Input
              id="restock-quantity"
              type="number"
              min={0}
              step={1}
              value={restockQuantity}
              onChange={(event) => setRestockQuantity(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockTarget(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={() => void submitRestock()} disabled={isSaving}>
              {isSaving ? "Saving..." : "Update stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(removeTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setRemoveTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove queue item?</DialogTitle>
            <DialogDescription>
              This removes the product from the current restock queue view. It can reappear
              automatically if stock remains below threshold after future updates.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)} disabled={isRemoving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void removeQueueItem()} disabled={isRemoving}>
              {isRemoving ? "Removing..." : "Remove item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
