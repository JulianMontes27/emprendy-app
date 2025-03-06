"use client";

import { CreateListModal } from "@/components/modals/dashboard/contacts/create-contact-list";
import ImportContactsModal from "@/components/modals/dashboard/contacts/import-contacts";
import CreateCampaignModal from "@/components/modals/dashboard/marketing/create";
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
    <>
      <ContactUsFormProvider />
      <ImportContactsModal />
      <CreateCampaignModal />
      <CreateListModal />
    </>
  );
};

export default ModalProvider;
