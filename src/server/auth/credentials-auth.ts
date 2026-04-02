"use server";

import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { users } from "@/server/db/schema";

const DEMO_USER = {
  name: "Demo User",
  email: "demo@gmail.com",
  password: "Demo12345",
} as const;

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
};

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  if (!email || !password) return null;

  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    await ensureDemoUser();
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((rows) => rows[0]);

  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.hashedPassword);

  if (!isValid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

async function ensureDemoUser() {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEMO_USER.email))
    .limit(1)
    .then((rows) => rows[0]);

  if (existing) {
    return;
  }

  const hashedPassword = await bcrypt.hash(DEMO_USER.password, 12);

  await db
    .insert(users)
    .values({
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      hashedPassword,
    })
    .onConflictDoNothing({ target: users.email });
}
