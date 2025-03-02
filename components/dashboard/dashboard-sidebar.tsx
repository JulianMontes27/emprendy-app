import getSession from "@/lib/get-session";
import { redirect } from "next/navigation";
import UserButton from "../auth/user-button";
import { ModeToggle } from "../themes/theme-toggle";
import RouteShowcase from "./route-showcase";
import { RouteList } from "@/app/(routes)/dashboard/layout";

const Sidebar = async ({ routes }: { routes: RouteList }) => {
  //check for auth (cached)
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    return redirect("/api/auth/signin");
  }

  return (
    <section className="fixed h-full flex flex-col gap-6 justify-center items-center bg-gray-100 dark:bg-gray-900/25 w-[100px] pb-6">
      <h1 className="mt-4">LOGO</h1>
      <div className="flex-1">
        <RouteShowcase routes={routes} />
      </div>
      <footer className="flex flex-col items-center justify-center gap-4">
        <ModeToggle />
        <UserButton user={user} />
      </footer>
    </section>
  );
};

export default Sidebar;
