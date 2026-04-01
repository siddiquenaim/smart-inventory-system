import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { categories, products } from "@/server/db/schema";
import type { ProductInput } from "@/lib/validations/product";

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
    status,
    stockQuantity,
    threshold,
    price,
  } = input;

  await db.insert(products).values({
    name,
    sku,
    description: description ?? "",
    categoryId,
    status,
    stockQuantity,
    threshold,
    price: price.toFixed(2),
  });
}

export async function updateProduct(id: string, input: ProductInput) {
  const {
    name,
    sku,
    description,
    categoryId,
    status,
    stockQuantity,
    threshold,
    price,
  } = input;

  await db
    .update(products)
    .set({
      name,
      sku,
      description: description ?? "",
      categoryId,
      status,
      stockQuantity,
      threshold,
      price: price.toFixed(2),
    })
    .where(eq(products.id, id));
}

export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
}
