"use client";

import { Button } from "@/components/ui/button";
import useModalStore from "@/hooks/use-store-modal";

interface CreateContactListBtnProps {
  contacts: any; // Replace 'any' with a proper type for better type safety
}

const CreateContactListBtn = ({ contacts }: CreateContactListBtnProps) => {
  const { onOpen } = useModalStore();

  return (
    <Button
      onClick={() => onOpen("create-contact-list", { contacts })}
      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white transition-colors"
      aria-label="Create contact list"
    >
      Crear Lista
    </Button>
  );
};

export default CreateContactListBtn;
