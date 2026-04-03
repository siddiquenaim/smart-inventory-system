import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { categories, products } from "@/server/db/schema";
import type { ProductInput } from "@/lib/validations/product";
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

export async function createProduct(input: ProductInput) {
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
        stockQuantity: products.stockQuantity,
        threshold: products.threshold,
      });

    const product = created[0];
    if (!product) {
      throw new Error("Unable to create product.");
    }

    await syncRestockQueueForProduct(tx, {
      productId: product.id,
      stockQuantity: product.stockQuantity,
      threshold: product.threshold,
    });
  });
}

export async function updateProduct(id: string, input: ProductInput) {
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
        stockQuantity: products.stockQuantity,
        threshold: products.threshold,
      });

    const product = updated[0];
    if (!product) {
      throw new Error("Unable to update product.");
    }

    await syncRestockQueueForProduct(tx, {
      productId: product.id,
      stockQuantity: product.stockQuantity,
      threshold: product.threshold,
    });
  });
}

export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
}
