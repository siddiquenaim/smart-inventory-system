import { db } from "@/server/db";
import { categories } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { CategoryInput } from "@/lib/validations/category";

export async function listCategories() {
  return await db
    .select()
    .from(categories)
    .orderBy(categories.createdAt);
}

export async function createCategory(input: CategoryInput) {
  const { name, description } = input;
  await db.insert(categories).values({
    name: name as unknown as string,
    description: (description ?? "") as unknown as string,
  });
}

export async function updateCategory(id: string, input: CategoryInput) {
  const { name, description } = input;
  await db
    .update(categories)
    .set({
      name: name as unknown as string,
      description: (description ?? "") as unknown as string,
    })
    .where(eq(categories.id, id));
}

export async function deleteCategory(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
}
