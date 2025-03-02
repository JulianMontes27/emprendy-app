import { ModeToggle } from "@/components/themes/theme-toggle";
import UserButton from "@/components/auth/user-button";
import { RouteList } from "../../layout";
import RouteShowcase from "./route-showcase";

const Sidebar = async ({ routes, user }: { routes: RouteList; user: any }) => {
  return (
    <section className="fixed h-full flex flex-col gap-6 justify-between items-center bg-white dark:bg-slate-900 w-[100px] border-r dark:border-slate-800 shadow-sm">
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
        <UserButton user={user} />
      </footer>
    </section>
  );
};

export default Sidebar;
