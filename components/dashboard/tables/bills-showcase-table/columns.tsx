"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Order } from "@prisma/client";
import BillsCellAction from "./cell-action";

export type BillType = {
  id: string;
  totalAmount: number;
  isPaid: boolean;
  orders: Order[];
};

export const columns: ColumnDef<BillType>[] = [
  {
    accessorKey: "id",
    header: "Bill ID",
  },
  {
    accessorKey: "totalAmount",
    header: () => <div className="">Amount (COP)</div>,
    cell: ({ row }) => {
      const formatted = new Intl.NumberFormat("es-Co", {
        style: "currency",
        currency: "COP",
      }).format(row.getValue("totalAmount"));

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "isPaid",
    header: "¿Pago?",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <BillsCellAction row={row} />;
    },
  },
];
