"use server";

import bcrypt from "bcrypt";

import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

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
