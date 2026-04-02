"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { OrderCreatePanel } from "@/components/orders/order-create-panel";
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
import { Skeleton } from "@/components/ui/skeleton";

type Product = {
  id: string;
  name: string;
  sku: string;
  status: "active" | "out_of_stock";
  stockQuantity: number;
  threshold: number;
  price: string | number;
};

const getResponseError = async (response: Response) => {
  const payload = await response.json().catch(() => null);
  return payload?.error ?? response.statusText ?? "Unable to complete request.";
};

export default function CreateOrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        setError(await getResponseError(response));
        setProducts([]);
        return;
      }
      const payload = (await response.json()) as Product[];
      setProducts(payload);
    } catch (fetchError) {
      setProducts([]);
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const lowStockCount = useMemo(
    () => products.filter((product) => product.stockQuantity <= product.threshold).length,
    [products]
  );

  return (
    <main className="space-y-6 pb-8">
      <Card className="border border-border/70 bg-card/80">
        <CardHeader>
          <div>
            <CardTitle className="text-2xl">Create Order</CardTitle>
            <CardDescription>
              Build customer orders with quantity checks and stock-aware pricing.
            </CardDescription>
          </div>
          <CardAction className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs uppercase tracking-[0.3em]">
              {products.length} products
            </Badge>
            <Badge variant={lowStockCount > 0 ? "destructive" : "secondary"}>
              {lowStockCount} low stock
            </Badge>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/orders">
                <ArrowLeft className="size-4" />
                Back to orders
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The UI prevents duplicate products in one order and blocks invalid quantities before
            submit.
          </p>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-2xl border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <Card className="border border-border/80 bg-card/70">
          <CardContent className="space-y-4 py-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
      ) : (
        <OrderCreatePanel
          products={products}
          onOrderCreated={async () => {
            await fetchProducts();
          }}
        />
      )}
    </main>
  );
}

