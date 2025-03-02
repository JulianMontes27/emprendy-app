"use server";

import { signOut } from "@/auth";

export const handleLogout = async () => {
  // // Call NextAuth's signOut method to log out the user
  await signOut({ redirectTo: "/" });
};
