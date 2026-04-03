import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/server/db";
import { activityLogs, users } from "@/server/db/schema";

type DbExecutor = Pick<typeof db, "insert" | "select">;

export const activityLogQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int("Limit must be a whole number.")
    .min(1, "Limit must be at least 1.")
    .max(10, "Limit cannot exceed 10.")
    .default(10),
});

type CreateActivityLogInput = {
  action: string;
  details: string;
  userId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function createActivityLog(
  executor: DbExecutor,
  input: CreateActivityLogInput
) {
  await executor.insert(activityLogs).values({
    action: input.action,
    details: input.details,
    userId: input.userId ?? null,
    metadata: JSON.stringify(input.metadata ?? {}),
  });
}

export async function listActivityLogs(limit = 10) {
  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      details: activityLogs.details,
      metadata: activityLogs.metadata,
      createdAt: activityLogs.createdAt,
      userId: activityLogs.userId,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}
