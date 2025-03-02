"use client";

import { Button } from "@/components/ui/button";
import useModalStore from "@/hooks/use-store-modal";
import { Bill, Order, Table } from "@prisma/client";

// Define a new type that excludes 'orders' from the Bill type
type BillWithoutOrders = Omit<Bill, "orders">;

interface AddOrderBtnProps {
  activeBill: (Bill & { orders: Order[] }) | undefined;
  table: Table;
}

const createBillObject = (
  activeBill: (Bill & { orders: Order[] }) | undefined
): BillWithoutOrders | undefined => {
  if (!activeBill) return undefined;

  // Create a new object excluding 'orders'
  const { orders, ...billWithoutOrders } = activeBill; // eslint-disable-line @typescript-eslint/no-unused-vars
  return billWithoutOrders;
};

const AddOrderBtn: React.FC<AddOrderBtnProps> = ({ activeBill, table }) => {
  const { onOpen } = useModalStore();
  const bill = createBillObject(activeBill);

  return (
    <Button
      variant={"outline"}
      onClick={() => onOpen("add-order", { bill, table })}
      className="max-w-xs text-black dark:text-black"
    >
      <span className="ml-2 font-bold">Agregar Orden</span>
    </Button>
  );
};

export default AddOrderBtn;
