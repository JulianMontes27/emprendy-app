import { Mail } from "lucide-react";
import { SignInBtn } from "../auth/signin-btn";
import DesktopNav from "./nav/desktop-nav";
import MobileNav from "./nav/mobile-nav";

const Header = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Emprendy
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <DesktopNav />
            <SignInBtn className="text-sm font-medium text-white bg-blue-700 hover:bg-blue-500 transition-colors">
              Ingresar
            </SignInBtn>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <MobileNav />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
