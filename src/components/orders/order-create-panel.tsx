"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
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

type Product = {
  id: string;
  name: string;
  sku: string;
  status: "draft" | "active" | "archived";
  stockQuantity: number;
  threshold: number;
  price: string | number;
};

type Line = {
  id: string;
  productId: string | null;
  quantity: number;
};

type OrderCreatePanelProps = {
  products: Product[];
  onOrderCreated?: () => Promise<void> | void;
};

const makeLineId = () => `line-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const toNumber = (value: string | number) =>
  typeof value === "number" ? value : Number(value ?? 0);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export function OrderCreatePanel({ products, onOrderCreated }: OrderCreatePanelProps) {
  const { data: session } = useSession();
  const [lines, setLines] = useState<Line[]>([
    { id: makeLineId(), productId: null, quantity: 1 },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const duplicateProductIds = useMemo(() => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    for (const line of lines) {
      if (!line.productId) continue;
      if (seen.has(line.productId)) {
        duplicates.add(line.productId);
      }
      seen.add(line.productId);
    }
    return duplicates;
  }, [lines]);

  const total = useMemo(() => {
    return lines.reduce((sum, line) => {
      const product = line.productId ? productMap.get(line.productId) : undefined;
      if (!product) return sum;
      return sum + toNumber(product.price) * line.quantity;
    }, 0);
  }, [lines, productMap]);

  const addLine = () => {
    setLines((current) => [...current, { id: makeLineId(), productId: null, quantity: 1 }]);
    setError(null);
    setSuccess(null);
  };

  const removeLine = (lineId: string) => {
    setLines((current) => {
      if (current.length === 1) {
        return current;
      }
      return current.filter((line) => line.id !== lineId);
    });
    setError(null);
    setSuccess(null);
  };

  const updateLineProduct = (lineId: string, productId: string) => {
    setLines((current) =>
      current.map((line) => (line.id === lineId ? { ...line, productId } : line))
    );
    setError(null);
    setSuccess(null);
  };

  const updateLineQuantity = (lineId: string, quantity: number) => {
    setLines((current) =>
      current.map((line) =>
        line.id === lineId ? { ...line, quantity: Number.isNaN(quantity) ? 0 : quantity } : line
      )
    );
    setError(null);
    setSuccess(null);
  };

  const validateBeforeSubmit = () => {
    const normalized = lines.map((line) => ({
      ...line,
      quantity: Number(line.quantity),
    }));

    if (normalized.length === 0) {
      return "Add at least one product line.";
    }

    for (const line of normalized) {
      if (!line.productId) {
        return "Every line must have a product selected.";
      }
      if (!Number.isInteger(line.quantity) || line.quantity < 1) {
        return "Quantities must be whole numbers greater than 0.";
      }
      const product = line.productId ? productMap.get(line.productId) : undefined;
      if (!product) {
        return "One or more selected products are invalid.";
      }
      if (line.quantity > product.stockQuantity) {
        return `Insufficient stock for ${product.name}.`;
      }
    }

    if (duplicateProductIds.size > 0) {
      return "Duplicate products are not allowed in a single order.";
    }

    return null;
  };

  const createOrder = async () => {
    setError(null);
    setSuccess(null);

    const sessionUser = session?.user as { id?: string } | undefined;
    const userId = sessionUser?.id;
    if (!userId) {
      setError("Your session is missing user id. Please sign out and sign in again.");
      return;
    }

    const validationError = validateBeforeSubmit();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        userId,
        items: lines.map((line) => ({
          productId: line.productId ?? "",
          quantity: Number(line.quantity),
        })),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "Unable to create order.");
        return;
      }

      const body = await response.json().catch(() => null);
      setSuccess(`Order ${body?.data?.orderNumber ?? ""} created successfully.`.trim());
      setLines([{ id: makeLineId(), productId: null, quantity: 1 }]);
      await onOrderCreated?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to create order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-border/80 bg-card/75">
      <CardHeader>
        <CardTitle>Create order</CardTitle>
        <CardDescription>
          Add product lines, set quantities, and submit once totals look correct.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            No products available yet. Create products first, then return to this page.
          </div>
        ) : null}
        {lines.map((line, index) => {
          const selectedProduct = line.productId
            ? productMap.get(line.productId)
            : undefined;
          const lineTotal = selectedProduct
            ? toNumber(selectedProduct.price) * line.quantity
            : 0;
          const isDuplicate = line.productId && duplicateProductIds.has(line.productId);
          const lowStock =
            selectedProduct && line.quantity > 0 && line.quantity >= selectedProduct.stockQuantity;

          return (
            <div key={line.id} className="rounded-2xl border border-border/70 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">Line {index + 1}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => removeLine(line.id)}
                  disabled={lines.length === 1}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-[2fr_1fr_auto] md:items-end">
                <div className="space-y-1">
                  <Label>Product</Label>
                  <Select
                    value={line.productId ?? undefined}
                    onValueChange={(value) => updateLineProduct(line.id, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.sku}) - Stock {product.stockQuantity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    value={line.quantity}
                    onChange={(event) =>
                      updateLineQuantity(line.id, Number(event.target.value))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <p className="text-sm font-medium">{formatCurrency(lineTotal)}</p>
                  {selectedProduct && (
                    <div className="flex justify-end gap-2">
                      <Badge variant="outline">{selectedProduct.status}</Badge>
                      {lowStock ? (
                        <Badge variant="destructive">Low stock risk</Badge>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
              {isDuplicate ? (
                <p className="mt-2 text-xs text-destructive">
                  This product is already selected in another line.
                </p>
              ) : null}
            </div>
          );
        })}

        {error ? (
          <div className="rounded-2xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
            {success}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" className="rounded-full" onClick={addLine}>
            <Plus className="size-4" />
            Add line
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">{formatCurrency(total)}</p>
            </div>
            <Button
              type="button"
              className="rounded-full"
              onClick={createOrder}
              disabled={isSubmitting || products.length === 0}
            >
              {isSubmitting ? "Creating..." : "Create order"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}




