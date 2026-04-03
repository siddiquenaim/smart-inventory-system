import { and, count, eq, gte, lte, sum } from "drizzle-orm";

import { db } from "@/server/db";
import { orders, products } from "@/server/db/schema";

const toDayStart = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const toDayEnd = (date: Date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

export async function getDashboardInsights() {
  const now = new Date();
  const dayStart = toDayStart(now);
  const dayEnd = toDayEnd(now);

  const [ordersTodayResult, pendingOrdersResult, completedOrdersResult, revenueTodayResult] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(orders)
        .where(and(gte(orders.createdAt, dayStart), lte(orders.createdAt, dayEnd)))
        .then((rows) => rows[0]?.value ?? 0),
      db
        .select({ value: count() })
        .from(orders)
        .where(eq(orders.status, "pending"))
        .then((rows) => rows[0]?.value ?? 0),
      db
        .select({ value: count() })
        .from(orders)
        .where(eq(orders.status, "delivered"))
        .then((rows) => rows[0]?.value ?? 0),
      db
        .select({ value: sum(orders.total) })
        .from(orders)
        .where(
          and(
            eq(orders.status, "delivered"),
            gte(orders.createdAt, dayStart),
            lte(orders.createdAt, dayEnd)
          )
        )
        .then((rows) => Number(rows[0]?.value ?? 0)),
    ]);

  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      stockQuantity: products.stockQuantity,
      threshold: products.threshold,
    })
    .from(products);

  const lowStockItemsCount = allProducts.filter(
    (product) => product.threshold > 0 && product.stockQuantity < product.threshold
  ).length;

  const productSummary = allProducts
    .map((product) => {
      const isLowStock =
        product.threshold > 0 && product.stockQuantity < product.threshold;

      return {
        id: product.id,
        name: product.name,
        stockQuantity: product.stockQuantity,
        threshold: product.threshold,
        state: isLowStock ? "Low Stock" : "OK",
        isLowStock,
      };
    })
    .sort((a, b) => {
      if (a.isLowStock !== b.isLowStock) {
        return a.isLowStock ? -1 : 1;
      }
      if (a.stockQuantity !== b.stockQuantity) {
        return a.stockQuantity - b.stockQuantity;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, 6)
    .map((product) => ({
      id: product.id,
      name: product.name,
      stockQuantity: product.stockQuantity,
      threshold: product.threshold,
      state: product.state,
    }));

  return {
    metrics: {
      totalOrdersToday: ordersTodayResult,
      pendingOrders: pendingOrdersResult,
      completedOrders: completedOrdersResult,
      lowStockItemsCount,
      revenueToday: Number(revenueTodayResult.toFixed(2)),
    },
    productSummary,
  };
}
