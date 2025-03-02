import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// const adminEmails = process.env.ADMIN_EMAILS?.split(",");

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [Google],
  // pages: {
  //   signIn: "/login",
  // },
  callbacks: {
    session: async ({ session, user }) => {
      // Fetch additional user data from the database
      const userFromDb = await db
        .select({
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, user.id))
        .then((result) => result[0]);

      if (userFromDb) {
        // Merge additional user data into the session
        session.user = {
          ...session.user,
          id: user.id,
          role: userFromDb.role, // Fix: Get role from DB, not user.role
        };
      }

      return session;
    },
    redirect({ url, baseUrl }) {
      // Check if the URL is a relative URL
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // If the URL is already absolute or starts with the baseUrl
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl + "/dashboard"; // Default fallback redirect
    },
  },
});
