import { Bill, Order } from "@prisma/client";
import { CreditCard } from "lucide-react";
import React from "react";
import PaymentBtn from "./payment-btn";

interface ClientBillProps {
  bill: Bill;
  tableNumber: string;
  orders: Order[];
}

const ClientBill: React.FC<ClientBillProps> = ({
  bill,
  tableNumber,
  orders,
}) => {
  return (
    <div className="w-full flex items-center justify-center flex-col gap-2">
      <h1 className="text-center">Table {tableNumber} - Bill</h1>
      <ul className="w-full flex flex-col items-center justify-center">
        {orders.map((order) => (
          <li key={order.id} className="max-w-xl flex flex-row gap-3">
            <p>
              {order.name}: ${order.price}
            </p>
            <CreditCard />
          </li>
        ))}
      </ul>
      <p>Total: ${bill.totalAmount}</p>
      <PaymentBtn bill={bill} />
    </div>
  );
};

export default ClientBill;
