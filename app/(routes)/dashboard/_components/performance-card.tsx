"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";

export function PerformanceCard() {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Rendimiento</CardTitle>
        <CardDescription>Métricas de los últimos 30 días</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="aperturas">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="aperturas">Aperturas</TabsTrigger>
            <TabsTrigger value="clics">Clics</TabsTrigger>
            <TabsTrigger value="respuestas">Respuestas</TabsTrigger>
          </TabsList>
          <TabsContent value="aperturas" className="pt-4">
            <div className="h-[220px] w-full rounded-lg bg-muted/30 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Gráfico de tasa de apertura
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Promedio</p>
                <p className="text-lg font-bold">24.5%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Mejor campaña</p>
                <p className="text-lg font-bold">32.8%</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="clics" className="pt-4">
            <div className="h-[220px] w-full rounded-lg bg-muted/30 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Gráfico de tasa de clics
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Promedio</p>
                <p className="text-lg font-bold">8.3%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Mejor campaña</p>
                <p className="text-lg font-bold">12.1%</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="respuestas" className="pt-4">
            <div className="h-[220px] w-full rounded-lg bg-muted/30 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Gráfico de tasa de respuesta
              </p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Promedio</p>
                <p className="text-lg font-bold">5.2%</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Mejor campaña</p>
                <p className="text-lg font-bold">7.8%</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
