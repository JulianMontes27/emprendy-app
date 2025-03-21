"use client";

import { Button } from "@/components/ui/button";
import useModalStore from "@/hooks/use-store-modal";

const ImportBtn = () => {
  const { onOpen } = useModalStore();

  return (
    <Button
      onClick={() => onOpen("import-contacts")}
      variant="outline"
      className="w-full sm:w-auto hover:bg-gray-100 transition-colors"
      aria-label="Import contacts"
    >
      Importar contactos
    </Button>
  );
};

export default ImportBtn;
