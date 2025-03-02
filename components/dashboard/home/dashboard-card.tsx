import { Bill, Order, Payment, Restaurant, Table } from "@prisma/client";
import { DashboardChart } from "./dashboard-chart";
import { allBills, getOrdersChartData } from "@/lib/dashboard/utils";

export type DataType = "total-bills-paid" | "orders-per-restaurant";

export type RestaurantWithTablesWithBillsWithOrdersWithPayment = Restaurant & {
  tables: (Table & {
    bills: (Bill & {
      orders: Order[];
      payment: Payment;
    })[];
  })[];
};

export interface DashboardSectionProps {
  data: RestaurantWithTablesWithBillsWithOrdersWithPayment[];
  type: DataType;
}

const DashboardCard: React.FC<DashboardSectionProps> = ({ data, type }) => {
  //on the server, determine for each instance which data to get from the Data object passed through props and pass it down to the chart component
  const dataMap = (dataType: DataType) => {
    const returnType = {
      "total-bills-paid": allBills(data),
      "orders-per-restaurant": getOrdersChartData(data),
    };
    return returnType[dataType]; //returns the data according to the type of the chart passed
  };
  const chartData = dataMap(type);

  return <DashboardChart data={chartData} type={type} />;
};

export default DashboardCard;
