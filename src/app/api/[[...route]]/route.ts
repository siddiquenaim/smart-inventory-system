import { Hono } from "hono";
import { handle } from "hono/vercel";

import { categorySchema } from "@/lib/validations/category";
import { productSchema } from "@/lib/validations/product";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/server/services/category.service";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from "@/server/services/product.service";
import {
  cancelOrder,
  createOrder,
  createOrderSchema,
  getOrderById,
  listOrders,
  orderListQuerySchema,
  updateOrderStatus,
  updateOrderStatusSchema,
} from "@/server/services/order.service";

const idValidator = (value: string | undefined) =>
  typeof value === "string" && /^[0-9a-fA-F-]{36}$/.test(value);

const normalizeOrderStatusError = (error: unknown) => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("invalid input value for enum order_status") ||
      message.includes("failed query: update \"orders\" set \"status\"")
    ) {
      return "Order status enum is outdated in the database. Run migrations/db push to align enum values (pending, confirmed, shipped, delivered, cancelled).";
    }
    return error.message;
  }
  return "Unable to process order status update.";
};

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

app.get("/products", async (c) => {
  const data = await listProducts();
  return c.json(data);
});

app.post("/products", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  }
  await createProduct(parsed.data);
  return c.json({ ok: true }, 201);
});

app.put("/products/:id", async (c) => {
  const { id } = c.req.param();
  if (!id || !idValidator(id)) {
    return c.json({ error: "Invalid id" }, 400);
  }
  const body = await c.req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  }
  await updateProduct(id, parsed.data);
  return c.json({ ok: true });
});

app.delete("/products/:id", async (c) => {
  const { id } = c.req.param();
  if (!id || !idValidator(id)) {
    return c.json({ error: "Invalid id" }, 400);
  }
  await deleteProduct(id);
  return c.json({ ok: true });
});

app.post("/orders", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  }

  try {
    const createdOrder = await createOrder(parsed.data);
    return c.json({ ok: true, data: createdOrder }, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create order.";
    return c.json({ error: message }, 400);
  }
});

app.get("/orders", async (c) => {
  const status = c.req.query("status");
  const dateFrom = c.req.query("dateFrom");
  const dateTo = c.req.query("dateTo");
  const parsed = orderListQuerySchema.safeParse({
    status: status || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid query" }, 400);
  }
  const data = await listOrders(parsed.data);
  return c.json(data);
});

app.get("/orders/:id", async (c) => {
  const { id } = c.req.param();
  if (!id || !idValidator(id)) {
    return c.json({ error: "Invalid id" }, 400);
  }
  const order = await getOrderById(id);
  if (!order) {
    return c.json({ error: "Order not found" }, 404);
  }
  return c.json(order);
});

app.patch("/orders/:id/status", async (c) => {
  const { id } = c.req.param();
  if (!id || !idValidator(id)) {
    return c.json({ error: "Invalid id" }, 400);
  }

  const body = await c.req.json().catch(() => null);
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, 400);
  }

  try {
    const result = await updateOrderStatus(id, parsed.data.status);
    return c.json({ ok: true, data: result });
  } catch (error) {
    const message = normalizeOrderStatusError(error);
    return c.json({ error: message }, 400);
  }
});

app.post("/orders/:id/cancel", async (c) => {
  const { id } = c.req.param();
  if (!id || !idValidator(id)) {
    return c.json({ error: "Invalid id" }, 400);
  }

  try {
    const result = await cancelOrder(id);
    return c.json({ ok: true, data: result });
  } catch (error) {
    const message = normalizeOrderStatusError(error);
    return c.json({ error: message }, 400);
  }
});

const handler = handle(app);

export {
  handler as DELETE,
  handler as GET,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
