"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Database, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const readinessItems = [
  {
    label: "Typed app router foundation",
    detail: "Clean route groups and shared boilerplate structure are in place.",
    icon: ShieldCheck,
  },
  {
    label: "Database pipeline connected",
    detail: "Drizzle config, schema, and Neon-ready connection are prepared.",
    icon: Database,
  },
  {
    label: "System health verified",
    detail: "Hono health routing is available for quick environment checks.",
    icon: CheckCircle2,
  },
];

export default function PublicHomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[30rem] bg-[radial-gradient(circle_at_top,rgba(123,160,255,0.16),transparent_48%)]" />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 sm:px-8 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <Badge
              variant="outline"
              className="border-primary/15 bg-primary/6 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary"
            >
              System Ready For Verification
            </Badge>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl">
              Smart inventory control with a calm, production-first baseline.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              This verification screen confirms the core boilerplate is wired:
              routing, styling, shadcn primitives, authentication structure,
              and API foundations.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full px-5">
                <Link href="/login">
                  Continue to login
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full px-5"
              >
                <Link href="/api/health">Check API health</Link>
              </Button>
            </div>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
          >
            <Card className="border border-white/50 bg-white/75 backdrop-blur-sm">
              <CardHeader>
                <Badge variant="secondary" className="w-fit">
                  Boilerplate Status
                </Badge>
                <CardTitle className="text-2xl tracking-[-0.03em]">
                  Initial system shell is online
                </CardTitle>
                <CardDescription className="max-w-md text-sm leading-6">
                  A minimal but polished checkpoint page for validating layout,
                  component styling, motion, and service wiring before feature
                  development begins.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {readinessItems.map(({ label, detail, icon: Icon }, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.16 + index * 0.08,
                      ease: "easeOut",
                    }}
                    className="flex items-start gap-4 rounded-2xl border border-border/70 bg-background/70 p-4"
                  >
                    <div className="mt-0.5 rounded-2xl bg-primary/10 p-2 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {detail}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
