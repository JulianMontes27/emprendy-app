// "use client";

// import Link from "next/link";
// import { useEffect, useState, useCallback } from "react";
// import { useSocketContext } from "@/providers/socket-provider";
// import { Bill, Order, Payment, Restaurant, Table } from "@prisma/client";

// import { CircleAlert } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// export type RestaurantWithTables = Restaurant & {
//   tables: (Table & {
//     bills: Bill[];
//   })[];
// };

// interface DashboardAlertProps {
//   res: RestaurantWithTables;
// }

// export const DashboardAlert: React.FC<DashboardAlertProps> = ({ res }) => {
//   const [restaurant, setRestaurant] = useState<RestaurantWithTables[] | null>(
//     res
//   );
//   const { socket } = useSocketContext();

//   const fetchRestaurantData = useCallback(async () => {
//     const response = await fetch(
//       `/api/restaurants/${params.restaurantId}/tables/${params.tableId}`
//     );
//     const data = await response.json();
//     setRestaurant(data);
//   }, [params.restaurantId, params.tableId]);

//   useEffect(() => {
//     fetchRestaurantData();
//   }, [fetchRestaurantData]);

//   useEffect(() => {
//     if (socket && params.tableId) {
//       console.log("CONNECTED");
//       const paymentKey = `table:${params.tableId}:pagos`;
//       const newBillKey = `table:${params.tableId}:new-bill`;

//       const handlePaymentUpdate = () => {
//         console.log("NEW PAYMENT RECEIVED");
//         fetchRestaurantData();
//       };

//       const handleNewBill = () => {
//         console.log("NEW BILL");
//         fetchRestaurantData();
//       };

//       socket.on(paymentKey, handlePaymentUpdate);
//       socket.on(newBillKey, handleNewBill);

//       return () => {
//         socket.off(paymentKey, handlePaymentUpdate);
//         socket.off(newBillKey, handleNewBill);
//       };
//     }
//   }, [socket, params.tableId, fetchRestaurantData]);

//   const activeBill = restaurant?.tables[0]?.bills.find((bill) => !bill.isPaid);

//   if (!restaurant || restaurant.tables.length === 0) {
//     return <div>Table not found for the given restaurant.</div>;
//   }

//   const paidBills = restaurant.tables[0].bills
//     .filter((bill) => bill.isPaid)
//     .map((bill) => ({
//       id: bill.id,
//       totalAmount: bill.totalAmount,
//       isPaid: bill.isPaid,
//       orders: bill.orders,
//     }));

//   return (
//     <Alert>
//       <CircleAlert className="w-4 h-4" color="green" />
//       <AlertTitle>
//         ¡Tienes <span className="font-bold">{activeBills.length}</span>{" "}
//         servicio(s) activo!
//       </AlertTitle>
//       <AlertDescription>
//         Mesas con servicios activos:
//         <ul>
//           {activeBills.map((activeBill) => {
//             return (
//               <Link
//                 key={activeBill.bill.id}
//                 href={`/dashboard/restaurants/${activeBill.restaurantId}/${activeBill.bill.tableId}`}
//               >
//                 <span>Atiende {activeBill.bill.server}</span>
//                 {"->"}
//                 <strong>${activeBill.bill.totalAmount}</strong>
//               </Link>
//             );
//           })}
//         </ul>
//       </AlertDescription>
//     </Alert>
//   );
// };
