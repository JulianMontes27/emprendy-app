"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Users,
  Mail,
  ListFilter,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import useModalStore from "@/hooks/use-store-modal";
import { Campaign, List, EmailTemplate } from "@/types/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

interface MarketingPageClientProps {
  campaigns: Campaign[];
  templates: EmailTemplate[];
  contactLists: List[];
}

const MarketingPageClient: React.FC<MarketingPageClientProps> = ({
  campaigns,
  templates,
  contactLists,
}) => {
  const router = useRouter();
  const { onOpen } = useModalStore();

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      borrador: "bg-gray-200 text-gray-800",
      programado: "bg-blue-100 text-blue-800",
      activo: "bg-green-100 text-green-800",
      completado: "bg-purple-100 text-purple-800",
      pausado: "bg-yellow-100 text-yellow-800",
      fallido: "bg-red-100 text-red-800",
    };
    return statusMap[status] || "bg-gray-200 text-gray-800";
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
          <p className="text-muted-foreground mt-1">
            Administre sus campañas de correo electrónico, plantillas y listas
            de contactos{" "}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() =>
              onOpen("create-campaign", {
                templates: templates,
                contactLists: contactLists,
              })
            }
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Campaña
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Campañas</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              {campaigns.filter((c) => c.status === "active").length} activas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Plantillas de Email
            </CardTitle>
            <ListFilter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              Listas para usar en campañas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Listas de Contactos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactLists.length}</div>
            <p className="text-xs text-muted-foreground">
              Grupo de contacto segmentado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList>
          <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          <TabsTrigger value="templates">Plantillas de Email</TabsTrigger>
          <TabsTrigger value="lists">Listas de Contactos</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Campañas recientes</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    No tienes campañas todavía
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Crea tu primera campaña de email para comenzar a interactuar
                    con tus contactos.
                  </p>
                  <Button
                    onClick={() =>
                      onOpen("create-campaign", {
                        contactLists,
                        templates,
                      })
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear campaña
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha (programada)</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">
                          {campaign.name}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(campaign.status!)}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(campaign.scheduledAt)}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/marketing/campaigns/${campaign.id}`
                              )
                            }
                          >
                            Editar <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Plantillas de Email</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpen("create-template")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ListFilter className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    No tienes plantillas todavía
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Cree plantillas de correo electrónico reutilizables para sus
                    campañas.{" "}
                  </p>
                  <Button onClick={() => onOpen("create-template")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Plantilla
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Creado</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">
                          {template.name}
                        </TableCell>
                        <TableCell>{template.type}</TableCell>
                        <TableCell>{template.category}</TableCell>
                        <TableCell>{formatDate(template.createdAt)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              template.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-200 text-gray-800"
                            }
                          >
                            {template.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            // onClick={() =>
                            //   onOpen("update-template", { id: template.id })
                            // }
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lists Tab */}
        <TabsContent value="lists">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Lista de Contactos</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpen("create-contact-list")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Lista
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {contactLists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    No tienes listas de contactos
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Crea listas segmentadas para organizar tus contactos.{" "}
                  </p>
                  <Button onClick={() => onOpen("create-contact-list")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create List
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Fecha creación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactLists.map((list) => (
                      <TableRow key={list.id}>
                        <TableCell className="font-medium">
                          {list.name}
                        </TableCell>

                        <TableCell>{formatDate(list.createdAt)}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              list.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-200 text-gray-800"
                            }
                          >
                            {list.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            // onClick={() =>
                            //   onOpen("update-contact-list", { id: list.id })
                            // }
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketingPageClient;
