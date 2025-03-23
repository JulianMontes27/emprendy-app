import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, MoreHorizontal, Settings, User } from "lucide-react";
import { handleLogout } from "@/actions/signout-client";
import getSession from "@/lib/get-session";

export default async function UserButton() {
  const session = await getSession();
  const user = session?.user;

  // If user is not found, return null
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Mobile user button */}
      <div className="block md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex cursor-pointer items-center rounded-md border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50">
              <div className="flex-shrink-0">
                {user.image ? (
                  <Image
                    src={user.image || "/placeholder.svg"}
                    alt="User profile picture"
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    {user.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  {user.name || "Usuario"}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Ver perfil
                </p>
              </div>
              <MoreHorizontal className="ml-1 h-4 w-4 text-slate-500 dark:text-slate-400" />
            </div>
          </DropdownMenuTrigger>
          <UserDropdownContent user={user} />
        </DropdownMenu>
      </div>

      {/* Desktop user button */}
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 items-center gap-2 rounded-full px-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {user.image ? (
                <Image
                  src={user.image || "/placeholder.svg"}
                  alt="User profile picture"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                  {user.name?.charAt(0) || "U"}
                </div>
              )}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {user.name}
              </span>
              <MoreHorizontal className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <UserDropdownContent user={user} />
        </DropdownMenu>
      </div>
    </>
  );
}

// Extracted dropdown content to avoid duplication
function UserDropdownContent({ user }: { user: any }) {
  return (
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">
            {user.name || "User"}
          </p>
          {user.email && (
            <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
          )}
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/account"
            className="flex w-full cursor-pointer items-center"
          >
            <User className="mr-2 h-4 w-4" />
            <span>Mi perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings"
            className="flex w-full cursor-pointer items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <form action={handleLogout} className="w-full">
          <Button
            type="submit"
            variant="ghost"
            className="flex w-full items-center justify-start p-0 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar sesión</span>
          </Button>
        </form>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
