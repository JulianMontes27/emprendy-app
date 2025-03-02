// components/dashboard/top-nav.tsx
"use client";

import { Menu, Search, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface User {
  name?: string;
  email?: string;
  image?: string;
}

interface TopNavProps {
  user: User;
}

export function TopNav({ user }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleMobileMenu}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="w-full flex-1 md:grow-0">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Clock className="mr-2 h-4 w-4" />
          Programar
        </Button>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nueva campaña
        </Button>
      </div>
    </header>
  );
}
