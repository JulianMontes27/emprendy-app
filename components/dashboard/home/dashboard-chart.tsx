"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DataType } from "./dashboard-card";
import { getRandomColor } from "@/lib/dashboard/utils";

interface DashboardChartProps {
  data: any;
  type: DataType;
}

type configType = {
  [key: string]: {
    label: string;
    color: string;
  };
};

const totalBillsChartConfig: configType = {
  amount: {
    label: "Servicio",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

// Fixed the config declaration and removed conflict markers
const ordersPerRestaurantConfig: configType = {} satisfies ChartConfig;

export const DashboardChart: React.FC<DashboardChartProps> = ({
  data,
  type,
}) => {
  // this config captures each restaurant dynamically and labels it with its name and colors it with a random hash value
  if (type === "orders-per-restaurant") {
    data.forEach(() => {
      // Get the keys of the object (excluding "month")
      const keys = Object.keys(data[0]);
      keys.map((key) => {
        if (key !== "month") {
          // Add the key to the chart config with a random color
          ordersPerRestaurantConfig[key] = {
            label: key,
            color: getRandomColor(), // Use the random color generator
          };
        }
      });
    });
  }
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>
          {type === "total-bills-paid"
            ? "Total ingresos"
            : type === "orders-per-restaurant"
            ? "Ordenes Entregadas por Restaurante"
            : ""}
        </CardTitle>
        <CardDescription>Oct - Dec 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer
          config={
            type === "orders-per-restaurant"
              ? ordersPerRestaurantConfig
              : totalBillsChartConfig
          }
          className="min-h-[150px] max-h-[200px] w-full"
        >
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {type === "total-bills-paid" && (
              <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
            )}
            {type === "orders-per-restaurant" &&
              Object.keys(ordersPerRestaurantConfig).map((key) => {
                return (
                  <Bar
                    dataKey={key}
                    key={key}
                    fill={ordersPerRestaurantConfig[key].color}
                    radius={4}
                  />
                );
              })}
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
