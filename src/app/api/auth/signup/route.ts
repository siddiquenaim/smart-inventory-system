import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { signupSchema } from "@/server/validations/auth";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);

  const parsed = signupSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .then((rows) => rows[0]);

  if (existingUser) {
    return NextResponse.json({ error: "Email already registered." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    name,
    email,
    hashedPassword,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
