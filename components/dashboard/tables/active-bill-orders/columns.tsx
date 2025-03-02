"use client";

import { ColumnDef } from "@tanstack/react-table";

// import CellAction from "./cell-action";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type OrderColumn = {
  id: string;
  billId: string;
  quantity: number;
  price: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
  },
  {
    accessorKey: "name",
    header: "Items",
  },

  {
    accessorKey: "price",
    header: "Price",
  },

  {
    accessorKey: "quantity",
    header: "#items",
  },
  {
    accessorKey: "createdAt",
    header: "Created at",
  },
  {
    accessorKey: "updatedAt",
    header: "Modified at",
  },
//   row actions
//   { id: "actions", cell: ({ row }) => <CellAction user={row.original} /> },
];
