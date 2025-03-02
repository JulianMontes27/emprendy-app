import Sidebar from "./_components/sidebar/dashboard-sidebar";
import { User as UserIcon, House, ChefHat, Files, Contact } from "lucide-react";
import { MobileSidebar } from "./_components/sidebar/mobile-sidebar";
import getSession from "@/lib/get-session";
import { notFound } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}
interface Route {
  href: string;
  title: string;
  icon: React.ReactNode;
}
export type RouteList = Route[];

export const routes: RouteList = [
  {
    href: `/dashboard`,
    title: "Principal",
    icon: <House />,
  },
  {
    href: `/dashboard/upload`,
    title: "Subir",
    icon: <Files />,
  },
  {
    href: `/dashboard/contacts`,
    title: "Contactos",
    icon: <Contact />,
  },

  {
    href: `/dashboard/account`,
    title: "Cuenta",
    icon: <UserIcon />,
  },
];

export const DashboardLayout: React.FC<DashboardLayoutProps> = async ({
  children,
}) => {
  const session = await getSession();
  const user = session?.user;
  if (!user) return notFound();

  return (
    <main className="h-full w-full flex flex-row bg-white dark:bg-slate-950">
      {/* sidebar desktop */}
      <section className="h-full hidden lg:flex flex-col overflow-x-hidden z-999 w-[75px]">
        <Sidebar routes={routes} user={user} />
      </section>
      <section className="flex flex-col w-full h-full lg:ml-[75px] relative">
        {/* mobile-version */}
        <div className="lg:hidden flex flex-row p-2 w-full fixed top-0 z-998 items-center bg-white h-10 border">
          <div className="flex flex-row gap-4 ">
            <MobileSidebar routes={routes} user={user} />
            <h1>LOGO</h1>
          </div>
          <div className="flex-1 flex justify-end">Data</div>
        </div>
        {/* children of layout */}
        <div className="h-full w-full p-3 lg:mt-0 mt-12">{children}</div>
      </section>
    </main>
  );
};

export default DashboardLayout;
