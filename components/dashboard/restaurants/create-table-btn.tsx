"use client";
import useModalStore from "@/hooks/use-store-modal";
import { Button } from "@/components/ui/button";

const CreateTableButton = () => {
  const { onOpen } = useModalStore();

  return (
    <Button variant={"outline"} onClick={() => onOpen("create-table")}>
      Crear nueva Mesa
    </Button>
  );
};

export default CreateTableButton;
