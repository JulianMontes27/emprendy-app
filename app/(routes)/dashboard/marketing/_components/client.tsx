"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, BarChart, Mail, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import useModalStore from "@/hooks/use-store-modal";
import { Campaign } from "@/types/types";

interface MarketingPageClientProps {
  campaigns?: any[];
  templates?: any;
}

const MarketingPageClient: React.FC<MarketingPageClientProps> = ({
  campaigns,
  templates,
}) => {
  const { onOpen } = useModalStore();

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cold Email Marketing</h1>
        <button
          onClick={() => onOpen("create-campaign")}
          className="bg-blue-400 p-2 flex flex-row  justify-center items-center text-white rounded-md hover:bg-blue-300 transition-all"
        >
          <Plus className="mr-2 h-4 w-4 " />
          Crear campaña
        </button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Campañas</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar campañas..."
                  className="pl-8 w-[200px]"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filtrar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Mandados</TableHead>
                <TableHead>Abiertos</TableHead>
                <TableHead>Respuestas</TableHead>
                <TableHead>Progreso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns?.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        campaign.status === "Scheduled"
                          ? "secondary"
                          : campaign.status === "Sent"
                          ? "default"
                          : "outline"
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.sent}</TableCell>
                  <TableCell>{campaign.opens}</TableCell>
                  <TableCell>{campaign.replies}</TableCell>
                  <TableCell>
                    <Progress value={campaign.progress} className="h-2" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/* Templates Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Templates</CardTitle>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map((template: any) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
            >
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* Contact Management Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Contact Lists</CardTitle>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Import Contacts
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>List Name</TableHead>
                <TableHead>Contacts</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Prospects</TableCell>
                <TableCell>1,200</TableCell>
                <TableCell>
                  <Badge variant="outline" className="mr-2">
                    Follow-Up
                  </Badge>
                  <Badge variant="outline">Q4 Outreach</Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Clients</TableCell>
                <TableCell>500</TableCell>
                <TableCell>
                  <Badge variant="outline">VIP</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingPageClient;
