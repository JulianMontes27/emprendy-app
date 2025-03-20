// app/api/auth/[...nextauth]/route.js
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { accounts } from "./db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.send",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const account = await db.query.accounts.findFirst({
        where: eq(accounts.userId, user.id),
      });
      if (account) {
        session.accessToken = account.access_token;
        session.refreshToken = account.refresh_token;
        session.provider = account.provider;
        session.userId = user.id;
        session.expiresAt = account.expires_at;
      }
      return session;
    },
  },
});
