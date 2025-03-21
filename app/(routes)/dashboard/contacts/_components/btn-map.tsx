"use client";

import ImportBtn from "@/components/dashboard/contacts/import-btn";
import CreateContactListBtn from "../../_components/contacts/create-list";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const ButtonMap = ({ contactsData }: { contactsData: any[] }) => {
  const searchParams = useSearchParams()?.get("tab") || "contacts";
  return (
    <>
      {searchParams === "contacts" ? (
        <>
          <ImportBtn />
        </>
      ) : (
        <CreateContactListBtn contacts={contactsData} />
      )}
    </>
  );
};

export default ButtonMap;
