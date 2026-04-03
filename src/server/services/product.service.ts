import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { categories, products } from "@/server/db/schema";
import type { ProductInput } from "@/lib/validations/product";
import { createActivityLog } from "@/server/services/activity.service";
import {
  resolveProductStatus,
  syncRestockQueueForProduct,
} from "@/server/services/restock.service";

export async function listProducts() {
  return await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      description: products.description,
      status: products.status,
      stockQuantity: products.stockQuantity,
      threshold: products.threshold,
      price: products.price,
      categoryId: products.categoryId,
      categoryName: categories.name,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(products.createdAt);
}

export async function createProduct(input: ProductInput, actorUserId?: string | null) {
  const {
    name,
    sku,
    description,
    categoryId,
    stockQuantity,
    threshold,
    price,
  } = input;

  await db.transaction(async (tx) => {
    const created = await tx
      .insert(products)
      .values({
        name,
        sku,
        description: description ?? "",
        categoryId,
        status: resolveProductStatus(stockQuantity),
        stockQuantity,
        threshold,
        price: price.toFixed(2),
      })
      .returning({
        id: products.id,
        name: products.name,
        stockQuantity: products.stockQuantity,
        threshold: products.threshold,
      });

    const product = created[0];
    if (!product) {
      throw new Error("Unable to create product.");
    }

    await syncRestockQueueForProduct(tx, {
      productId: product.id,
      productName: product.name,
      stockQuantity: product.stockQuantity,
      threshold: product.threshold,
      actorUserId,
    });

    await createActivityLog(tx, {
      action: "product_created",
      details: `Product "${product.name}" created`,
      userId: actorUserId,
      metadata: {
        productId: product.id,
        stockQuantity: product.stockQuantity,
        threshold: product.threshold,
      },
    });
  });
}

export async function updateProduct(
  id: string,
  input: ProductInput,
  actorUserId?: string | null
) {
  const {
    name,
    sku,
    description,
    categoryId,
    stockQuantity,
    threshold,
    price,
  } = input;

  await db.transaction(async (tx) => {
    const updated = await tx
      .update(products)
      .set({
        name,
        sku,
        description: description ?? "",
        categoryId,
        status: resolveProductStatus(stockQuantity),
        stockQuantity,
        threshold,
        price: price.toFixed(2),
      })
      .where(eq(products.id, id))
      .returning({
        id: products.id,
        name: products.name,
        stockQuantity: products.stockQuantity,
        threshold: products.threshold,
      });

    const product = updated[0];
    if (!product) {
      throw new Error("Unable to update product.");
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
  });
}

export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
}
