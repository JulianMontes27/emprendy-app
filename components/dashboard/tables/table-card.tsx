import { Table } from "@prisma/client";
import Image from "next/image";
import ActionBtn from "../restaurants/restaurant-actions-btn";
import Link from "next/link";

interface RestaurantCardProps {
  restaurantId: string;
  table: Table;
}

const TableCard: React.FC<RestaurantCardProps> = ({ restaurantId, table }) => {
  return (
    <div className="rounded-lg p-4 shadow-sm shadow-indigo-100 w-full  flex flex-col items-center">
      <Link href={`/dashboard/restaurants/${restaurantId}/${table.id}`}>
        <Image
          src={table.qrCodeUrl!}
          alt={`QR code for table ${table.tableNumber}`}
          className=""
          width={300}
          height={300}
        />
      </Link>

      <div className="mt-2 w-full">
        <div className="flex items-center justify-center w-full flex-col">
          <h1 className="font-bold">
            Mesa # <span>{table.tableNumber}</span>
          </h1>
        </div>
        <div className="mt-6  flex flex-row items-center gap-6 text-xs justify-center">
          <ActionBtn action={"delete"} type={"table"} table={table} />
          <ActionBtn action={"update"} type={"table"} table={table} />
        </div>
      </div>
    </div>
  );
};

export default TableCard;
