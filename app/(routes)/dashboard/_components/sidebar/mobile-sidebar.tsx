import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { RouteList } from "../../layout";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import UserButton from "@/components/auth/user-button";
import { ModeToggle } from "@/components/themes/theme-toggle";

export const MobileSidebar = async ({
  routes,
  user,
}: {
  routes: RouteList;
  user: any;
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu className="w-6 h-6 text-slate-900 dark:text-white cursor-pointer" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900">
          {/* Header */}
          <div className="p-6 border-b dark:border-slate-800">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              LOGO
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 p-6">
            <div className="flex flex-col gap-4">
              {routes.map((route) => (
                <div key={route.href}>
                  <Link
                    href={route.href}
                    className="flex flex-row items-center gap-4 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {route.icon}
                    <span className="text-sm font-medium">{route.title}</span>
                  </Link>
                  <Separator className="my-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer (User Button and Theme Toggle) */}
          <div className="p-6 border-t dark:border-slate-800">
            <div className="flex items-center justify-between">
              <UserButton user={user} />
              <ModeToggle />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
