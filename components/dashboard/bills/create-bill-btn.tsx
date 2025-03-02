"use client";

import useModalStore from "@/hooks/use-store-modal";
import { Table, Bill } from "@prisma/client";

interface CreateBillBtnProps {
  table: Table;
  activeBill: Bill | undefined;
}

const CreateBillBtn: React.FC<CreateBillBtnProps> = ({ table, activeBill }) => {
  const { onOpen } = useModalStore();

  const isDisabled = activeBill === undefined ? false : true;
  return (
    <button
      disabled={isDisabled}
      onClick={() => {
        onOpen("initiate-bill", { table: table });
      }}
      className={`px-4 py-2 font-semibold rounded ${
        isDisabled
          ? "bg-gray-400 text-gray-600 cursor-not-allowed"
          : "bg-blue-500 text-white"
      }`}
    >
      Iniciar servicio
    </button>
  );
};

export default CreateBillBtn;
