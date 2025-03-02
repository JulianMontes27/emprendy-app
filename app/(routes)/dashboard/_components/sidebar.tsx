// components/dashboard/sidebar.tsx
import {
  Home,
  Mail,
  FileText,
  Users,
  BarChart3,
  Calendar,
  Settings,
  ChevronDown,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarToggle } from "./sidebar/toggle";
import { SidebarWrapper } from "./sidebar/wrapper";
import { Button } from "@/components/ui/button";

interface User {
  name?: string;
  email?: string;
  image?: string;
}

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  return (
    <SidebarWrapper>
      {(toggleMobileMenu) => (
        <>
          <div className="flex h-14 items-center border-b px-4">
            <h2 className="text-lg font-semibold">EmailPro</h2>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto md:hidden"
              onClick={toggleMobileMenu}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-2">
              <Button variant="ghost" className="justify-start gap-2" asChild>
                <a href="/dashboard">
                  <Home className="h-4 w-4" />
                  <span>Inicio</span>
                </a>
              </Button>
              <Button variant="ghost" className="justify-start gap-2" asChild>
                <a href="/dashboard/campaigns">
                  <Mail className="h-4 w-4" />
                  <span>Campañas</span>
                </a>
              </Button>
              <Button variant="ghost" className="justify-start gap-2" asChild>
                <a href="/dashboard/templates">
                  <FileText className="h-4 w-4" />
                  <span>Plantillas</span>
                </a>
              </Button>
              <Button variant="ghost" className="justify-start gap-2" asChild>
                <a href="/dashboard/contacts">
                  <Users className="h-4 w-4" />
                  <span>Contactos</span>
                </a>
              </Button>
              <Button variant="ghost" className="justify-start gap-2" asChild>
                <a href="/dashboard/analytics">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analíticas</span>
                </a>
              </Button>
              <Button variant="ghost" className="justify-start gap-2" asChild>
                <a href="/dashboard/calendar">
                  <Calendar className="h-4 w-4" />
                  <span>Calendario</span>
                </a>
              </Button>
            </nav>
          </div>
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage
                  src={user.image || ""}
                  alt={user.name || "Usuario"}
                />
                <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {user.name || "Usuario"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.email || ""}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configuración</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/api/auth/signout">Cerrar sesión</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </>
      )}
    </SidebarWrapper>
  );
}
