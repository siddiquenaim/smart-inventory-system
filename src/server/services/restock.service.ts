import { asc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db";
import { categories, products, restockQueue } from "@/server/db/schema";
import { createActivityLog } from "@/server/services/activity.service";

type DbExecutor = Pick<typeof db, "select" | "insert" | "update" | "delete">;

type ProductStockSnapshot = {
  productId: string;
  productName?: string;
  stockQuantity: number;
  threshold: number;
  actorUserId?: string | null;
};

const LOW_STOCK_NOTE = "Auto-managed low stock queue entry.";

export const restockQueueUpdateSchema = z.object({
  stockQuantity: z.coerce
    .number()
    .int("Stock quantity must be a whole number.")
    .min(0, "Stock quantity cannot be negative."),
});

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
  const existingQueueItem = await executor
    .select({
      id: restockQueue.id,
    })
    .from(restockQueue)
    .where(eq(restockQueue.productId, product.productId))
    .limit(1)
    .then((rows) => rows[0]);

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

  if (!existingQueueItem && product.productName) {
    await createActivityLog(executor, {
      action: "restock_queue_added",
      details: `Product "${product.productName}" added to Restock Queue`,
      userId: product.actorUserId,
      metadata: {
        productId: product.productId,
        stockQuantity: product.stockQuantity,
        threshold: product.threshold,
        priority,
      },
    });
  }
}

export async function listRestockQueue() {
  return await db
    .select({
      id: restockQueue.id,
      productId: restockQueue.productId,
      priority: restockQueue.priority,
      requestedAt: restockQueue.requestedAt,
      note: restockQueue.note,
      productName: products.name,
      sku: products.sku,
      categoryName: categories.name,
      stockQuantity: products.stockQuantity,
      threshold: products.threshold,
      status: products.status,
    })
    .from(restockQueue)
    .innerJoin(products, eq(restockQueue.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(products.stockQuantity), asc(restockQueue.requestedAt));
}

export async function updateRestockQueueStock(
  queueId: string,
  stockQuantity: number,
  actorUserId?: string | null
) {
  return await db.transaction(async (tx) => {
    const queueItem = await tx
      .select({
        id: restockQueue.id,
        productId: restockQueue.productId,
      })
      .from(restockQueue)
      .where(eq(restockQueue.id, queueId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!queueItem) {
      throw new Error("Restock queue item not found.");
    }

    const updatedProducts = await tx
      .update(products)
      .set({
        stockQuantity,
        status: resolveProductStatus(stockQuantity),
      })
      .where(eq(products.id, queueItem.productId))
      .returning({
        id: products.id,
        name: products.name,
        stockQuantity: products.stockQuantity,
        threshold: products.threshold,
        status: products.status,
      });

    const product = updatedProducts[0];
    if (!product) {
      throw new Error("Product not found for restock queue item.");
    }

    await syncRestockQueueForProduct(tx, {
      productId: product.id,
      productName: product.name,
      stockQuantity: product.stockQuantity,
      threshold: product.threshold,
      actorUserId,
    });

    await createActivityLog(tx, {
      action: "stock_updated",
      details: `Stock updated for "${product.name}"`,
      userId: actorUserId,
      metadata: {
        productId: product.id,
        stockQuantity: product.stockQuantity,
        threshold: product.threshold,
      },
    });

    return {
      productId: product.id,
      productName: product.name,
      stockQuantity: product.stockQuantity,
      threshold: product.threshold,
      status: product.status,
      remainsInQueue: product.threshold > 0 && product.stockQuantity < product.threshold,
    };
  });
}

export async function removeRestockQueueItem(queueId: string) {
  const deleted = await db
    .delete(restockQueue)
    .where(eq(restockQueue.id, queueId))
    .returning({ id: restockQueue.id });

  const item = deleted[0];
  if (!item) {
    throw new Error("Restock queue item not found.");
  }

  return item;
}
