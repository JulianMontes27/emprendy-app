"use client";

import { useState, useEffect } from "react";
import { CreateListModal } from "@/components/modals/dashboard/contacts/upload-contacts";
import ImportContactsModal from "@/components/modals/dashboard/contacts/import-contacts";
import CreateCampaignModal from "@/components/modals/dashboard/marketing/create-campaign";
import ContactUsFormProvider from "@/components/modals/landing/contact_us";
import CreateTemplateModal from "@/components/modals/dashboard/marketing/templates/create-template";

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
      <CreateTemplateModal />
    </>
  );
};

export default ModalProvider;
