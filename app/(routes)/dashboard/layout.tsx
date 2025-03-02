import Sidebar from "@/components/dashboard/dashboard-sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { User as UserIcon, House } from "lucide-react";

interface Route {
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
/* Main layout for the dynamic User dashboard. Children must be wrapped wuth the onboarding context */
export const DashboardLayout: React.FC<DashboardLayoutProps> = async ({
  children,
}) => {
  return (
    <main className="h-full w-full flex flex-row bg-white text-black">
      {/* sidebar desktop */}
      <section className="h-full hidden lg:flex flex-col overflow-x-hidden z-999 w-[75px]">
        <Sidebar routes={routes} />
      </section>
      <section className="flex flex-col w-full  h-full lg:ml-[75px] relative">
        {/* mobile-version */}
        <div className="lg:hidden flex flex-row h-[75px] p-4 w-full fixed top-0  z-999 items-center bg-white">
          <div className="flex flex-row gap-4 bg-white ">
            <MobileSidebar routes={routes} />
            <h1>LOGO</h1>
          </div>
          <div className="flex-1 flex justify-end">Data</div>
        </div>
        {/* children of layout */}
        <div className="h-full w-full lg:mt-0 mt-[75px] p-3">{children}</div>
      </section>
    </main>
  );
};

export default DashboardLayout;
