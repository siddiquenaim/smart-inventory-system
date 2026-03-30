"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowLeft, Loader2, LockKeyhole, Mail } from "lucide-react";

import { DEMO_CREDENTIALS, ROUTES } from "@/lib/constants";
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  function handleSignIn(nextEmail: string, nextPassword: string) {
    setIsPending(true);
    setError("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: nextEmail,
        password: nextPassword,
        callbackUrl: ROUTES.dashboard,
        redirect: false,
      });

      if (!result?.ok) {
        setError("Invalid credentials. Use the demo account to continue.");
        setIsPending(false);
        return;
      }

      router.push(result.url ?? ROUTES.dashboard);
      router.refresh();
      setIsPending(false);
    });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16 sm:px-8 lg:px-10">
      <div className="grid w-full gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex flex-col justify-center">
          <Badge
            variant="outline"
            className="w-fit border-primary/20 bg-primary/8 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary"
          >
            Secure Access
          </Badge>
          <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl">
            Sign in to the inventory control workspace.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
            This boilerplate login screen verifies the credentials flow,
            session handling, and the protected route pattern before feature
            development starts.
          </p>
          <div className="mt-8 rounded-3xl border border-border/70 bg-card/70 p-5">
            <p className="text-sm font-medium text-foreground">
              Demo credentials
            </p>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <p>Email: {DEMO_CREDENTIALS.email}</p>
              <p>Password: {DEMO_CREDENTIALS.password}</p>
            </div>
          </div>
          <Button
            asChild
            variant="ghost"
            className="mt-6 w-fit rounded-full px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
          >
            <Link href={ROUTES.home}>
              <ArrowLeft className="size-4" />
              Back to home
            </Link>
          </Button>
        </section>

        <Card className="border border-white/50 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              Credentials Login
            </Badge>
            <CardTitle className="text-2xl tracking-[-0.03em]">
              Welcome back
            </CardTitle>
            <CardDescription className="max-w-md leading-6">
              Sign in with the demo account or enter the credentials manually to
              confirm NextAuth is wired correctly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                handleSignIn(email, password);
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 rounded-2xl pl-11"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 rounded-2xl pl-11"
                    disabled={isPending}
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  size="lg"
                  className="flex-1 rounded-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Signing in
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="flex-1 rounded-full"
                  disabled={isPending}
                  onClick={() => {
                    setEmail(DEMO_CREDENTIALS.email);
                    setPassword(DEMO_CREDENTIALS.password);
                    handleSignIn(
                      DEMO_CREDENTIALS.email,
                      DEMO_CREDENTIALS.password,
                    );
                  }}
                >
                  Use demo login
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
