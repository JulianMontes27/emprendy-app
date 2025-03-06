"use client";

import useModalStore from "@/hooks/use-store-modal";
import { Button } from "@/components/ui/button";

const CreateContactListBtn = ({ contacts }: { contacts: any }) => {
  const { onOpen } = useModalStore();
  return (
    <Button
      onClick={() => onOpen("create-contact-list", { contacts })}
      className="w-full sm:w-auto bg-blue-500"
    >
      Crear Lista
    </Button>
  );
};

export default CreateContactListBtn;
