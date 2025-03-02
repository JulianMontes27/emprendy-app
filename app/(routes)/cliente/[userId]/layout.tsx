import Sidebar from "@/components/dashboard/dashboard-sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { User as UserIcon, House } from "lucide-react";

export interface Route {
  href: string;
  title: string;
  icon: React.ReactNode;
}

export type RouteList = Route[];

export const routes: RouteList = [
  {
    href: `/dashboard`,
    title: "Dashboard",
    icon: <House />,
  },
  {
    href: `/dashboard/account`,
    title: "Cuenta",
    icon: <UserIcon />,
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout for the dynamic User dashboard
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <main className="h-full w-full flex bg-white text-black">
      {/* Desktop Sidebar */}
      <aside className="h-full hidden lg:block w-[75px] fixed">
        <Sidebar routes={routes} />
      </aside>

      {/* Main Content */}
      <div className="w-full lg:pl-[75px] min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden flex justify-between items-center h-[75px] px-4 fixed top-0 left-0 right-0 bg-white z-40 border-b">
          <div className="flex items-center gap-4">
            <MobileSidebar routes={routes} />
            <h1 className="font-bold">LOGO</h1>
          </div>
          <div>Data</div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:pt-4 pt-[85px]">{children}</div>
      </div>
    </main>
  );
};

export default DashboardLayout;
