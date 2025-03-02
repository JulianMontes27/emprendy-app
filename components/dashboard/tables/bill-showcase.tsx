import { Bill, Order } from "@prisma/client";
import { DataTableBills } from "./bills-showcase-table/data-table";
import { columns } from "./bills-showcase-table/columns";

interface BillShowcaseProps {
  bills: (Bill & {
    orders: Order[];
  })[];
}

const BillShowcase: React.FC<BillShowcaseProps> = ({ bills }) => {
  return (
    <section className="mt-4">
      <div className="text-lg font-bold">Historial de servicios</div>
      <DataTableBills columns={columns} data={bills} />
    </section>
  );
};

export default BillShowcase;
