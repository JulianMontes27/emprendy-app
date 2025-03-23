import type { RouteList } from "@/types/types";
import {
  UserIcon,
  HomeIcon as House,
  Contact,
  MailPlus,
  Search,
  Bell,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./_components/sidebar/mobile-sidebar";
import UserButton from "@/components/auth/user-button";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: {
    userId: string;
  };
}

export const routes: RouteList = [
  {
    href: `/dashboard`,
    title: "Principal",
    icon: <House className="h-4 w-4" />,
  },
  {
    href: `/dashboard/contacts`,
    title: "Contactos",
    icon: <Contact className="h-4 w-4" />,
  },
  {
    href: `/dashboard/marketing`,
    title: "Campañas",
    icon: <MailPlus className="h-4 w-4" />,
  },
  {
    href: `/dashboard/account`,
    title: "Cuenta",
    icon: <UserIcon className="h-4 w-4" />,
  },
];

export const Layout: React.FC<DashboardLayoutProps> = async ({ children }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
          <Mail className="mr-2 h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span className="text-lg font-semibold text-slate-900 dark:text-white">
            MailPro
          </span>
        </div>

        <div className="flex flex-col p-4">
          <div className="mb-6">
            <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Navegación
            </div>
            <nav className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  <span className="flex gap-2 flex-row">
                    {route.icon}
                    {route.title}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User profile */}
          <UserButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="flex items-center md:hidden">
            <MobileSidebar routes={routes} />
            <Mail className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              MailPro
            </span>
          </div>

          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="relative hidden w-full max-w-md md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar campañas, contactos..."
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
