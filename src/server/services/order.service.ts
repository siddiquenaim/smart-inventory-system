import {
  and,
  desc,
  eq,
  gte,
  inArray,
  lte,
  type SQL,
} from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db";
import { orderItems, orders, products, users } from "@/server/db/schema";

const ORDER_STATUS_VALUES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

const orderItemSchema = z.object({
  productId: z.string().uuid("Product id must be a valid UUID."),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1."),
});

export const createOrderSchema = z.object({
  userId: z.string().uuid("User id must be a valid UUID."),
  items: z.array(orderItemSchema).min(1, "At least one order item is required."),
});

export const orderListQuerySchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;

const buildOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-10);
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `ORD-${timestamp}-${suffix}`;
};

const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const toIsoDateStart = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const toIsoDateEnd = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

export async function listOrders(filters: OrderListQuery = {}) {
  const whereConditions: SQL[] = [];

  if (filters.status) {
    whereConditions.push(eq(orders.status, filters.status));
  }
  if (filters.dateFrom) {
    whereConditions.push(gte(orders.createdAt, toIsoDateStart(filters.dateFrom)));
  }
  if (filters.dateTo) {
    whereConditions.push(lte(orders.createdAt, toIsoDateEnd(filters.dateTo)));
  }

  return await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      userId: orders.userId,
      userName: users.name,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(desc(orders.createdAt));
}

export async function getOrderById(orderId: string) {
  const orderRow = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      userId: orders.userId,
      userName: users.name,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, orderId))
    .limit(1)
    .then((rows) => rows[0]);

  if (!orderRow) {
    return null;
  }

  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      productName: products.name,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId))
    .orderBy(orderItems.createdAt);

  return {
    ...orderRow,
    items: items.map((item) => ({
      ...item,
      lineTotal: (Number(item.unitPrice) * item.quantity).toFixed(2),
    })),
  };
}

export async function createOrder(input: CreateOrderInput) {
  const duplicateIds = new Set<string>();
  const seen = new Set<string>();
  for (const item of input.items) {
    if (seen.has(item.productId)) {
      duplicateIds.add(item.productId);
    }
    seen.add(item.productId);
  }

  if (duplicateIds.size > 0) {
    throw new Error("Duplicate products are not allowed in a single order.");
  }

  return await db.transaction(async (tx) => {
    const productIds = input.items.map((item) => item.productId);

    const selectedProducts = await tx
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        stockQuantity: products.stockQuantity,
      })
      .from(products)
      .where(inArray(products.id, productIds));

    if (selectedProducts.length !== productIds.length) {
      throw new Error("One or more products were not found.");
    }

    const productMap = new Map(selectedProducts.map((product) => [product.id, product]));

    let total = 0;
    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error("One or more products were not found.");
      }
      if (product.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}.`
        );
      }
      total += Number(product.price) * item.quantity;
    }

    const createdOrder = await tx
      .insert(orders)
      .values({
        userId: input.userId,
        orderNumber: buildOrderNumber(),
        total: total.toFixed(2),
        status: "pending",
      })
      .returning({
        id: orders.id,
        orderNumber: orders.orderNumber,
        total: orders.total,
        status: orders.status,
      });

    const order = createdOrder[0];
    if (!order) {
      throw new Error("Order creation failed.");
    }

    for (const item of input.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error("One or more products were not found.");
      }

      await tx.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(product.price).toFixed(2),
      });

      const nextStock = product.stockQuantity - item.quantity;
      await tx
        .update(products)
        .set({
          stockQuantity: nextStock,
          status: nextStock <= 0 ? "out_of_stock" : "active",
        })
        .where(eq(products.id, item.productId));
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
    };
  });
}

export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus) {
  return await db.transaction(async (tx) => {
    const currentOrder = await tx
      .select({
        id: orders.id,
        status: orders.status,
      })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!currentOrder) {
      throw new Error("Order not found.");
    }

    if (currentOrder.status === nextStatus) {
      return currentOrder;
    }

    const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentOrder.status];
    if (!allowedNextStatuses.includes(nextStatus)) {
      throw new Error(
        `Invalid transition from ${currentOrder.status} to ${nextStatus}.`
      );
    }

    if (nextStatus === "cancelled") {
      const itemRows = await tx
        .select({
          productId: orderItems.productId,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .where(eq(orderItems.orderId, currentOrder.id));

      const restockProductIds = itemRows.map((item) => item.productId);
      const restockProducts = await tx
        .select({
          id: products.id,
          stockQuantity: products.stockQuantity,
        })
        .from(products)
        .where(inArray(products.id, restockProductIds));

      const stockMap = new Map(restockProducts.map((product) => [product.id, product]));
      for (const item of itemRows) {
        const product = stockMap.get(item.productId);
        if (!product) continue;
        const nextStock = product.stockQuantity + item.quantity;
        await tx
          .update(products)
          .set({
            stockQuantity: nextStock,
            status: nextStock > 0 ? "active" : "out_of_stock",
          })
          .where(eq(products.id, item.productId));
      }
    }

    const updated = await tx
      .update(orders)
      .set({ status: nextStatus })
      .where(eq(orders.id, currentOrder.id))
      .returning({
        id: orders.id,
        status: orders.status,
      });

    const row = updated[0];
    if (!row) {
      throw new Error("Unable to update order.");
    }

    return row;
  });
}

export async function cancelOrder(orderId: string) {
  return await updateOrderStatus(orderId, "cancelled");
}
