"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants";

type FormState = { name: string; email: string; password: string };

const initialState: FormState = {
  name: "",
  email: "",
  password: "",
};
const PASSWORD_GUIDANCE = "Must be 8+ chars, mix of upper/lower, digits.";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage(null);

    let response: Response | null = null;

    try {
      response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch (error) {
      setIsPending(false);
      setMessage({
        type: "error",
        text: "Unable to reach the signup endpoint",
      });

      console.log({ error });
      return;
    }

    setIsPending(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setMessage({
        type: "error",
        text: payload?.error ?? "Unable to create account.",
      });
      return;
    }
    setMessage({
      type: "success",
      text: "Account created. Redirecting to login...",
    });
    setTimeout(() => router.push(ROUTES.login), 1200);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16 sm:px-8 lg:px-10">
      <Card className="w-full border border-white/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            Sign Up
          </Badge>
          <CardTitle className="text-3xl tracking-[-0.04em] text-foreground">
            Create your inventory account
          </CardTitle>
          <CardDescription className="max-w-lg">
            Provide your basic details and a secure password to join the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Jane Doe"
                required
                className="h-11 rounded-2xl"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="you@example.com"
                required
                className="h-11 rounded-2xl"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  placeholder="At least 8 characters"
                  required
                  className="h-11 rounded-2xl"
                  disabled={isPending}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{PASSWORD_GUIDANCE}</p>
            {message ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  message.type === "error"
                    ? "border-destructive/50 bg-destructive/10 text-destructive"
                    : "border-primary/50 bg-primary/10 text-primary"
                }`}
              >
                {message.text}
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4">
              <Button
                type="submit"
                size="lg"
                className="rounded-full"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating account
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
              <Button asChild variant="ghost" className="rounded-full">
                <Link href={ROUTES.login}>Back to login</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
