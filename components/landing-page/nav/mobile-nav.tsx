"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const MobileNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#faq", label: "FAQ" },
    { href: "/api/auth/signin", label: "Ingresar" },
  ];

  return (
    <div className="md:hidden">
      {/* Menu Toggle Button */}
      <button
        onClick={toggleMenu}
        className="text-gray-600 hover:text-blue-600 focus:outline-none"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-4 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex flex-col p-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 transition-colors"
                onClick={toggleMenu} // Close menu on link click
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;
