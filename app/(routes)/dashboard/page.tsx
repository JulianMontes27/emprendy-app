// app/dashboard/page.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, Clock, Plus, FileText, BarChart3 } from "lucide-react";
import { DashboardMetrics } from "./_components/content";
import { PerformanceCard } from "./_components/performance-card";

export default function DashboardPage() {
  return (
    <div>
      <DashboardMetrics />

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Campañas recientes</CardTitle>
            <CardDescription>
              Has enviado 12 campañas en los últimos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Presentación de servicios",
                  date: "12 mar 2024",
                  status: "Activa",
                  progress: 45,
                  sent: 150,
                  opened: 68,
                  replied: 12,
                },
                {
                  name: "Seguimiento clientes",
                  date: "5 mar 2024",
                  status: "Completada",
                  progress: 100,
                  sent: 200,
                  opened: 124,
                  replied: 28,
                },
                {
                  name: "Invitación webinar",
                  date: "28 feb 2024",
                  status: "Completada",
                  progress: 100,
                  sent: 300,
                  opened: 189,
                  replied: 42,
                },
                {
                  name: "Oferta especial",
                  date: "15 feb 2024",
                  status: "Completada",
                  progress: 100,
                  sent: 250,
                  opened: 175,
                  replied: 38,
                },
              ].map((campaign, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {campaign.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {campaign.date}
                        </span>
                        <Badge
                          variant={
                            campaign.status === "Activa"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{campaign.sent} enviados</span>
                      <span>•</span>
                      <span>{campaign.opened} abiertos</span>
                      <span>•</span>
                      <span>{campaign.replied} respuestas</span>
                    </div>
                  </div>
                  <div className="ml-4 w-24">
                    <Progress value={campaign.progress} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Ver todas las campañas
            </Button>
          </CardFooter>
        </Card>

        <PerformanceCard />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button className="justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Crear nueva campaña
            </Button>
            <Button variant="outline" className="justify-start">
              <FileText className="mr-2 h-4 w-4" />
              Crear plantilla
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="mr-2 h-4 w-4" />
              Importar contactos
            </Button>
            <Button variant="outline" className="justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Ver reportes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos envíos</CardTitle>
            <CardDescription>
              Campañas programadas para los próximos días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Seguimiento leads",
                  date: "Mañana, 10:00 AM",
                  recipients: 120,
                },
                {
                  name: "Promoción mensual",
                  date: "15 mar, 9:00 AM",
                  recipients: 350,
                },
                {
                  name: "Invitación evento",
                  date: "20 mar, 8:00 AM",
                  recipients: 200,
                },
              ].map((campaign, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{campaign.name}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {campaign.date}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {campaign.recipients} contactos
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">
              Ver calendario
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consejos de optimización</CardTitle>
            <CardDescription>
              Mejora el rendimiento de tus campañas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Mejora tus asuntos",
                  description:
                    "Tus asuntos tienen una tasa de apertura por debajo del promedio. Prueba asuntos más personalizados.",
                },
                {
                  title: "Segmenta tu audiencia",
                  description:
                    "Las campañas segmentadas tienen un 26% más de tasa de apertura que las generales.",
                },
                {
                  title: "Optimiza horarios",
                  description:
                    "Tus mejores resultados son los martes y jueves por la mañana. Programa tus envíos en esos momentos.",
                },
              ].map((tip, i) => (
                <div key={i} className="space-y-1">
                  <h4 className="text-sm font-medium">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">
              Ver todos los consejos
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
