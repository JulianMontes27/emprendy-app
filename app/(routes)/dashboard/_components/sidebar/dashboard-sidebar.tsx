import { ModeToggle } from "@/components/themes/theme-toggle";
import UserButton from "@/components/auth/user-button";
import RouteShowcase from "./route-showcase";
import { RouteList } from "@/types/types";
import getSession from "@/lib/get-session";

const Sidebar = async ({ routes }: { routes: RouteList }) => {
  const session = await getSession();
  const user = session?.user;
  if (!user) return null;

  return (
    <section className="fixed h-full flex flex-col gap-6 justify-between items-center bg-white/70 backdrop-blur-lg dark:bg-slate-900/70 w-[100px] border-r border-gray-200 dark:border-slate-800 shadow-lg">
      {/* Logo */}
      <div className="mt-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          LOGO
        </h1>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col justify-center">
        <RouteShowcase routes={routes} />
      </div>

      {/* Footer (Theme Toggle and User Button) */}
      <footer className="flex flex-col items-center justify-center gap-4 pb-6">
        <ModeToggle />
        <UserButton userId={user.id!} />
      </footer>
    </section>
  );
};

export default Sidebar;
