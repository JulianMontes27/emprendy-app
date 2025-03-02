"use client";

import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MenuIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { RouteList } from "./navbar";

export const MobileNav = ({
  routes,
}: {
  routes: RouteList;
  restaurantId: string;
}) => {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center justify-center h-full w-full ">
        <MenuIcon className="h-4 w-4 ml-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuGroup>
          {routes.map((route) => {
            return (
              <div key={route.href}>
                <DropdownMenuItem
                  onClick={() => router.push(route.href)}
                  className={cn("cursor-pointer border-b")}
                >
                  {route.title}
                </DropdownMenuItem>
              </div>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
