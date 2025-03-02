import { RestaurantWithTablesWithBillsWithOrdersWithPayment } from "@/components/dashboard/home/dashboard-card";
import { Bill, Payment } from "@prisma/client";

export const sumTotalProfit = (bills: Bill[]): number => {
  return bills.reduce((total, activeBill) => total + activeBill.totalAmount, 0);
};

export const sumTotalPayments = (payments: Payment[]): number => {
  return payments.reduce((acc, num) => acc + (num?.amount ?? 0), 0);
};

export const allBills = (
  data: RestaurantWithTablesWithBillsWithOrdersWithPayment[]
) => {
  const monthlyPayments: Record<string, number> = {};
  //get each Bill of the data set
  const bills = data
    .flatMap((restaurant) => restaurant.tables)
    .flatMap((table) => table.bills);
  //map through the data of PAID bills and extract the Payment from it
  bills.forEach((bill) => {
    //extract the Date of the Payment
    if (bill.isPaid === true) {
      const month = bill.payment.paymentDate.toLocaleString("es-CO", {
        month: "long",
        timeZone: "America/Bogota",
      });
      monthlyPayments[month] =
        (monthlyPayments[month] || 0) + bill.payment.amount;
    }
  });

  const chartData = Object.entries(monthlyPayments).map(([month, amount]) => ({
    month,
    amount,
  }));
  //testing
  chartData.unshift({ month: "octubre", amount: 200000 });
  chartData.unshift({ month: "septiembre", amount: 150000 });

  return chartData;
};

//return an array of objets containing all of the PAID orders that each restaurant had in each MONTH
export const getOrdersChartData = (data: any) => {
  // Object to store orders per month for each restaurant
  const monthlyRestaurantOrders: Record<string, Record<string, number>> = {};

  // Collect all UNIQUE months across all orders
  const uniqueMonths = new Set<string>();

  // Loop through each restaurant
  data.forEach((restaurant: any) => {
    //initialize the Restaurant's key in the monthlyRestaurantOrders object
    if (!monthlyRestaurantOrders[restaurant.name]) {
      monthlyRestaurantOrders[restaurant.name] = {};
    }

    // Iterate over tables and bills to aggregate orders
    restaurant.tables.forEach((table: any) => {
      table.bills.forEach((bill: any) => {
        bill.orders.forEach((order: any) => {
          // Extract the month from the order date
          if (bill.isPaid) {
            const month = order.createdAt.toLocaleString("es-CO", {
              month: "long",
              timeZone: "America/Bogota",
            });

            // Add month to uniqueMonths set
            uniqueMonths.add(month);

            // Initialize the count for the month if not already set
            if (!monthlyRestaurantOrders[restaurant.name][month]) {
              monthlyRestaurantOrders[restaurant.name][month] = 0;
            }

            // Increment the order count for the month
            monthlyRestaurantOrders[restaurant.name][month] += 1;
          }
        });
      });
    });
  });
  // Sort unique months in order (you may need to adjust this for your needs)
  const monthOrder = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const sortedMonths = Array.from(uniqueMonths).sort(
    (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
  );

  // Create chartData array in the desired format (Set -> Array)
  //This conversion is necessary because arrays have methods like sort that Set objects do not.
  const chartData = sortedMonths.map((month) => {
    // Use a more flexible type for monthData
    const monthData: { month: string; [key: string]: number | string } = {
      month,
    };

    // Populate each restaurant's order count for this month
    Object.keys(monthlyRestaurantOrders).forEach((restaurant) => {
      monthData[restaurant] = monthlyRestaurantOrders[restaurant][month] || 0;
    });

    return monthData;
  });

  return chartData;
};

// Utility function to generate a random hex color
export const getRandomColor = () => {
  // Generate a random color in hex format
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};
