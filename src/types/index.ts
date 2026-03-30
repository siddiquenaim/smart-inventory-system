import type { ROUTES } from "@/lib/constants";

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

export type DemoCredentials = {
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  email?: string | null;
  name?: string | null;
};
