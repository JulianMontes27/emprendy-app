"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";
import useModalStore from "@/hooks/use-store-modal";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { onOpen } = useModalStore();

  const navLinks = [
    { href: "#features", label: "Sobre" },
    { href: "#memberships", label: "Planes" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo */}
        <Link href="/" className="text-2xl md:text-md font-bold text-green-700">
          Escuela de Tenis de Bocagrande
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-green-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            className="rounded-md bg-slate-700"
            onClick={() => onOpen("contact")}
          >
            Estoy interesado
          </Button>
          <Link href="/dashboard" className="w-full">
            <Button className="rounded-md bg-green-700 w-full">Ingresar</Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-gray-600 hover:text-green-700 transition-colors"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="flex flex-col items-center gap-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-green-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="w-full px-6 flex flex-col gap-4">
              <Button
                className="rounded-md bg-slate-700 w-full"
                onClick={() => {
                  onOpen("contact");
                  setIsMobileMenuOpen(false);
                }}
              >
                Estoy interesado
              </Button>
              <Link href="/dashboard" className="w-full">
                <Button className="rounded-md bg-green-700 w-full">
                  Ingresar
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
