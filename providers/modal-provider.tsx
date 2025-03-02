"use client";

import ContactUsFormProvider from "@/components/modals/landing/contact_us";
import { useState, useEffect } from "react";

const ModalProvider = () => {
  const [isMounted, setisMounted] = useState(false);
  useEffect(() => {
    setisMounted(true);
  }, []);
  if (!isMounted) {
    //we are still on the server
    return null;
  }
  return (
    <div className="">
      <ContactUsFormProvider />
    </div>
  );
};

export default ModalProvider;
