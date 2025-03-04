// next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession`, and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    // user: {
    //   id: string;
    //   // role: string; // 👈 Add 'role' so TypeScript recognizes it
    //   name: string;
    //   email: string;
    // };
  }
}
