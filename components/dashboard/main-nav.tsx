"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { RouteList } from "./navbar";
import { cn } from "@/lib/utils";

const MainNav = ({ routes }: { routes: RouteList; restaurantId: string }) => {
  const pathname = usePathname();

  return (
    <ul className="xl:flex h-full items-center md:gap-6 hidden ">
      {routes.map((route) => (
        <Link
          key={route.title}
          href={route.href}
          className={cn(
            "dark:text-white",
            pathname?.search(route.href) !== -1 &&
              route.title !== "Overview" &&
              "font-bold"
          )}
        >
          {route.title}
        </Link>
      ))}
    </ul>
  );
};

export default MainNav;
