"use client";

import Link from "next/link";
import Image from "next/image";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";

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

const DEMO_CREDENTIALS = {
  email: "demo@gmail.com",
  password: "Demo12345",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = (credentials = { email, password }) => {
    const { email: credentialEmail, password: credentialPassword } =
      credentials;
    setEmail(credentialEmail);
    setPassword(credentialPassword);
    setIsPending(true);
    setError("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: credentialEmail,
        password: credentialPassword,
        callbackUrl: ROUTES.dashboard,
        redirect: false,
      });

      if (!result?.ok) {
        setError("Invalid credentials.");
        setIsPending(false);
        return;
      }

      router.push(result.url ?? ROUTES.dashboard);
      router.refresh();
      setIsPending(false);
    });
  };

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
            This login screen verifies the credentials flow, session handling,
            and the protected route pattern before feature development starts.
          </p>
          <div className="mt-8 rounded-3xl border border-border/70 bg-card/70 p-5">
            <p className="text-sm font-medium text-foreground">New here?</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Create an account when you are ready.{" "}
              <Link className="text-primary underline" href={ROUTES.signup}>
                Request access
              </Link>
              .
            </p>
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
            <Image
              alt="logo"
              src="https://i.ibb.co.com/Ps5BhJ63/smart-inv.png"
              width={72}
              height={72}
              className="mx-auto mb-2"
            />
            <Badge variant="secondary" className="w-fit">
              Credentials Login
            </Badge>
            <CardTitle className="text-2xl tracking-[-0.03em]">
              Welcome back
            </CardTitle>
            <CardDescription className="max-w-md leading-6">
              Sign in with the email you used during signup.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault();
                handleSignIn();
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
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 rounded-2xl pl-11"
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="flex justify-between">
                <Link
                  className="text-sm text-primary underline"
                  href={ROUTES.signup}
                >
                  Create new account
                </Link>
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="rounded-full"
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
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
