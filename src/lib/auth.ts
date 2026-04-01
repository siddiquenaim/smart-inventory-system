import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { ROUTES } from "@/lib/constants";
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = String(token.id);
      }
      return session;
    },
  },
  pages: {
    signIn: ROUTES.login,
  },
};
