"use client";

import { Button } from "@/components/ui/button";
import useModalStore from "@/hooks/use-store-modal";

const ImportBtn = () => {
  const { onOpen } = useModalStore();
  return (
    <Button
      onClick={() => onOpen("import-contacts")}
      variant={"outline"}
      className="w-full sm:w-auto"
    >
      Importar contactos
    </Button>
  );
};

export default ImportBtn;
