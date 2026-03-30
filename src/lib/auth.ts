import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { DEMO_CREDENTIALS, ROUTES } from "@/lib/constants";
import { authenticateUser } from "@/server/auth/credentials-auth";

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
        const sessionUser = await authenticateUser(email, password);
        return sessionUser ?? null;
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
