"use client";

import { useState } from "react";
import { Mail, Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold">Emprendy</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              FAQ
            </a>
            <Link href="/dashboard" className="w-full">
              <Button className="bg-blue-600 text-white font-medium rounded-lg px-8 py-4 text-center hover:bg-blue-700 transition-all shadow-md hover:shadow-lg">
                Ingresar
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-3 space-y-3 flex flex-col gap-2">
            <a
              href="#features"
              className="block text-gray-600 hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="block text-gray-600 hover:text-blue-600 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#testimonials"
              className="block text-gray-600 hover:text-blue-600 transition-colors"
            >
              Testimonials
            </a>
            <a
              href="#faq"
              className="block text-gray-600 hover:text-blue-600 transition-colors"
            >
              FAQ
            </a>
            <Link href="/dashboard" className="w-full">
              <Button className="bg-blue-600 text-white font-medium rounded-lg px-8 py-4 text-center hover:bg-blue-700 transition-all shadow-md hover:shadow-lg w-full">
                Ingresar
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Header;
