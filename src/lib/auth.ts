import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { DEMO_CREDENTIALS, ROUTES } from "@/lib/constants";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        if (!email || !password) {
          return null;
        }

        if (
          email === DEMO_CREDENTIALS.email &&
          password === DEMO_CREDENTIALS.password
        ) {
          return {
            id: "demo-user",
            name: "Demo User",
            email: DEMO_CREDENTIALS.email,
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: ROUTES.login,
  },
};
