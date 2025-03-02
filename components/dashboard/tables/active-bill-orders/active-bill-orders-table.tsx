import { Order } from "@prisma/client";
import { columns } from "./columns";
import { DataTable } from "./data-table";

interface ActiveBillOrdersTableProps {
  orders: Order[];
}

export default function ActiveBillOrdersTable({
  orders,
}: ActiveBillOrdersTableProps) {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={orders} />
    </div>
  );
}
