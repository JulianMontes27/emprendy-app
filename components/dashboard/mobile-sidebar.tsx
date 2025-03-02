"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { RouteList } from "@/app/(routes)/dashboard/layout";
import Link from "next/link";
import { Separator } from "../ui/separator";
import UserButton from "../auth/user-button";
import { ModeToggle } from "../themes/theme-toggle";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const MobileSidebar = ({ routes }: { routes: RouteList }) => {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const session = await response.json();

        if (!session.user) {
          router.push("/api/auth/signin");
        } else {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Failed to get session:", error);
        router.push("/api/auth/signin");
      }
    };

    checkSession();
  }, [router]);

  if (!user) {
    return null; // Don't render anything while checking auth
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <nav className="flex flex-col h-full py-6">
          <div className="flex-1 flex flex-col gap-2 w-full px-4">
            {routes.map((route) => (
              <div key={route.href} className="w-full">
                <Link
                  href={route.href}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-100 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-gray-600">{route.icon}</span>
                  <span>{route.title}</span>
                </Link>
                <Separator className="my-2" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between px-6 mt-4">
            <UserButton user={user} />
            <ModeToggle />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
