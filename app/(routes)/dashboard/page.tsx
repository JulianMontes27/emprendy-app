import { redirect } from "next/navigation";
import getSession from "@/lib/get-session";

/* pre-rendered on the Server at request time */
const DashboardHomePage = async () => {
  const session = await getSession();
  const user = session?.user;

  // If no user, redirect to sign-in page
  if (!user) {
    redirect("/api/auth/signin?callbackUrl=/dashboard");
  }

  // If user role is "user", redirect to client page
  if (user?.role === "user") {
    redirect(`/cliente/${user.id}`);
  }

  // For non-user roles (admin, etc.)
  return (
    <div className="flex flex-col gap-3 ">
      <section className="w-full gap-3">{user?.role}</section>
    </div>
  );
};

export default DashboardHomePage;
