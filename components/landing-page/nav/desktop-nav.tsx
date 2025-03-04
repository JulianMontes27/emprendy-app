"use client";

const DesktopNav = () => {
  return (
    <div className="flex flex-row gap-5">
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
    </div>
  );
};

export default DesktopNav;
