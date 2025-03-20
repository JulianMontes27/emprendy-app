// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession`, and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    // allow accessToken to be string, undefined, or null, matching the database’s possible values.
    accessToken?: string | null; // the Session interface now includes an optional accessToken field, which you’re populating in the session callback.
    refreshToken: string | null;
    provider?: string | null;
    userId?: string | null;
    expiresAt?: number | null;
  }
}
