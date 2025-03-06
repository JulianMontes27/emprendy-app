import { RouteList } from "@/types/types";
import Sidebar from "./_components/sidebar/dashboard-sidebar";
import { MobileSidebar } from "./_components/sidebar/mobile-sidebar";
import { User as UserIcon, House, Contact, MailPlus } from "lucide-react";

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
    icon: <House className="h-5 w-5" />,
  },
  {
    href: `/dashboard/contacts`,
    title: "Contactos",
    icon: <Contact className="h-5 w-5" />,
  },
  {
    href: `/dashboard/marketing`,
    title: "Campañas",
    icon: <MailPlus className="h-5 w-5" />,
  },
  {
    href: `/dashboard/account`,
    title: "Cuenta",
    icon: <UserIcon className="h-5 w-5" />,
  },
];

export const Layout: React.FC<DashboardLayoutProps> = async ({ children }) => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden  bg-white/70 backdrop-blur-lg dark:bg-gray-800/70 lg:block">
        <Sidebar routes={routes} />
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 z-20 w-full bg-white/70 backdrop-blur-lg dark:bg-gray-800/70 lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <MobileSidebar routes={routes} />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              LOGO
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              DATA
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="lg:ml-[100px]">
        <div className="p-6 lg:mt-0 mt-16">{children}</div>
      </div>
    </main>
  );
};

export default Layout;
