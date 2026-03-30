import { Hono } from "hono";
import { handle } from "hono/vercel";

import { categorySchema } from "@/lib/validations/category";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/server/services/category.service";

const idValidator = (value: string | undefined) =>
  typeof value === "string" && /^[0-9a-fA-F-]{36}$/.test(value);

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

app.get("/health", (c) => {
  return c.json({
    ok: true,
    message: "API is healthy",
  });
});

app.get("/categories", async (c) => {
  const data = await listCategories();
  return c.json(data);
});

app.post("/categories", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  }
  await createCategory(parsed.data);
  return c.json({ ok: true }, 201);
});

app.put("/categories/:id", async (c) => {
  const { id } = c.req.param();
  if (!id || !idValidator(id)) {
    return c.json({ error: "Invalid id" }, 400);
  }
  const body = await c.req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  }
  await updateCategory(id, parsed.data);
  return c.json({ ok: true });
});

app.delete("/categories/:id", async (c) => {
  const { id } = c.req.param();
  if (!id || !idValidator(id)) {
    return c.json({ error: "Invalid id" }, 400);
  }
  await deleteCategory(id);
  return c.json({ ok: true });
});

const handler = handle(app);

export {
  handler as DELETE,
  handler as GET,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
