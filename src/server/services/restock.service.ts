import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { restockQueue } from "@/server/db/schema";

type DbExecutor = Pick<typeof db, "select" | "insert" | "update" | "delete">;

type ProductStockSnapshot = {
  productId: string;
  stockQuantity: number;
  threshold: number;
};

const LOW_STOCK_NOTE = "Auto-managed low stock queue entry.";

export const resolveProductStatus = (stockQuantity: number) =>
  stockQuantity <= 0 ? "out_of_stock" : "active";

export const resolveRestockPriority = (
  stockQuantity: number,
  threshold: number
) => {
  if (stockQuantity <= 0) {
    return "high" as const;
  }

  const stockRatio = threshold > 0 ? stockQuantity / threshold : 1;
  if (stockRatio <= 0.5) {
    return "medium" as const;
  }

  return "low" as const;
};

export async function syncRestockQueueForProduct(
  executor: DbExecutor,
  product: ProductStockSnapshot
) {
  if (product.threshold <= 0 || product.stockQuantity >= product.threshold) {
    await executor.delete(restockQueue).where(eq(restockQueue.productId, product.productId));
    return;
  }

  const priority = resolveRestockPriority(product.stockQuantity, product.threshold);

  await executor
    .insert(restockQueue)
    .values({
      productId: product.productId,
      priority,
      resolved: false,
      resolvedAt: null,
      note: LOW_STOCK_NOTE,
    })
    .onConflictDoUpdate({
      target: restockQueue.productId,
      set: {
        priority,
        resolved: false,
        resolvedAt: null,
        note: LOW_STOCK_NOTE,
      },
    });
}
