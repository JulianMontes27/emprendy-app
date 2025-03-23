import { notFound } from "next/navigation";
import { db } from "@/db";
import {
  campaigns,
  campaignsToLists,
  lists,
  contactsToLists,
  contacts,
  emailTemplates,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Mail,
  Send,
  Users,
  CheckCircle,
  XCircle,
  CalendarClock,
  ArrowLeft,
  ExternalLink,
  BarChart3,
  Eye,
  MousePointer,
} from "lucide-react";
import { format } from "date-fns";
import type { Contact } from "@/types/types";
import StartCampaignButton from "../../_components/start-campaign-client";
import EditEmailContent from "../../_components/edit-email-content";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CampaignPage = async ({
  params,
}: {
  params: {
    campaignId: string;
  };
}) => {
  // Fetch campaign details
  const campaign = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, params.campaignId))
    .limit(1);
  if (!campaign.length) {
    return notFound(); // Show a 404 page if the campaign is not found
  }
  const campaignData = campaign[0];

  // Fetch associated lists and their contacts
  const associatedListsWithContacts = await db
    .select({
      listId: lists.id,
      listName: lists.name,
      contactId: contacts.id,
      contactEmail: contacts.email,
      contactFirstName: contacts.firstName,
      contactLastName: contacts.lastName,
    })
    .from(campaignsToLists)
    .innerJoin(lists, eq(campaignsToLists.listId, lists.id))
    .innerJoin(contactsToLists, eq(lists.id, contactsToLists.listId))
    .innerJoin(contacts, eq(contactsToLists.contactId, contacts.id))
    .where(eq(campaignsToLists.campaignId, params.campaignId));

  // Group contacts by list
  const listsWithContacts = associatedListsWithContacts.reduce((acc, row) => {
    if (!acc[row.listId]) {
      acc[row.listId] = {
        id: row.listId,
        name: row.listName,
        contacts: [],
      };
    }
    acc[row.listId].contacts.push({
      id: row.contactId,
      email: row.contactEmail,
      firstName: row.contactFirstName,
      lastName: row.contactLastName,
    });
    return acc;
  }, {} as Record<string, { id: string; name: string; contacts: Contact[] }>);
  const groupedContacts = Object.values(listsWithContacts);

  // Fetch template details
  const template = await db
    .select({
      id: emailTemplates.id,
      name: emailTemplates.name,
      subject: emailTemplates.subject,
      content: emailTemplates.content,
    })
    .from(emailTemplates)
    .where(eq(emailTemplates.id, campaignData.templateId))
    .limit(1);
  const templateData = template.length ? template[0] : null;

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return (
          <Badge
            variant="outline"
            className="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            Borrador
          </Badge>
        );
      case "scheduled":
      case "programada":
        return (
          <Badge
            variant="outline"
            className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300"
          >
            Programada
          </Badge>
        );
      case "sending":
      case "enviando":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
          >
            Enviando
          </Badge>
        );
      case "sent":
      case "enviada":
      case "completada":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
          >
            Enviada
          </Badge>
        );
      case "activa":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
          >
            Activa
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate total recipients
  const totalRecipients = groupedContacts.reduce(
    (total, list) => total + list.contacts.length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-1 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <Link href={`/dashboard/marketing`}>
            <ArrowLeft className="h-4 w-4" />
            Volver a campañas
          </Link>
        </Button>
      </div>

      {/* Campaign Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {campaignData.name}
            </h1>
            {campaignData.status && getStatusBadge(campaignData.status)}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Creada {format(new Date(campaignData.createdAt!), "PPP")}
            </span>
            {campaignData.scheduledAt && (
              <span className="inline-flex items-center gap-1 ml-4">
                <CalendarClock className="h-4 w-4" />
                Programada para{" "}
                {format(new Date(campaignData.scheduledAt), "PPP p")}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm dark:border-slate-800 dark:bg-slate-800">
            <Users className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span className="font-medium text-slate-900 dark:text-white">
              {totalRecipients}{" "}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                destinatarios
              </span>
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 border-slate-200 dark:border-slate-700"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Estadísticas</span>
          </Button>
          <StartCampaignButton
            campaign={campaignData}
            contacts={groupedContacts.flatMap((list) => list.contacts)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Email Content and Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content */}
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-white">
                <Mail className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                Contenido del Email
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <EditEmailContent
                templateData={templateData}
                campaignData={campaignData}
              />
            </CardContent>
          </Card>

          {templateData && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Link
                href={`/dashboard/marketing/templates/${templateData.id}`}
                className="group flex items-center gap-3 rounded-md p-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-400 dark:group-hover:bg-indigo-900">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Plantilla
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {templateData.name}
                  </p>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-slate-400 dark:text-slate-500" />
              </Link>
            </div>
          )}

          {/* Associated Lists */}
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-white">
                <Users className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                Listas de Contactos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {groupedContacts.length > 0 ? (
                <div className="space-y-6">
                  {groupedContacts.map((list) => (
                    <div key={list.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                          <Users className="h-4 w-4" />
                        </div>
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {list.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="border-slate-200 dark:border-slate-700"
                        >
                          {list.contacts.length} contactos
                        </Badge>
                      </div>
                      <div className="pl-10 space-y-1">
                        {list.contacts.slice(0, 5).map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
                            <span className="font-medium text-slate-900 dark:text-white">
                              {contact.firstName} {contact.lastName}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {contact.email}
                            </span>
                          </div>
                        ))}
                        {list.contacts.length > 5 && (
                          <div className="pl-2 pt-1">
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-indigo-600 dark:text-indigo-400"
                            >
                              Ver {list.contacts.length - 5} más
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="mb-4 h-12 w-12 text-slate-300 dark:text-slate-700" />
                  <p className="text-slate-500 dark:text-slate-400">
                    No hay listas asociadas a esta campaña.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Settings and Status */}
        <div className="space-y-6">
          {/* Campaign Stats */}
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-white">
                <BarChart3 className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Aperturas
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    0%
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <MousePointer className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Clics
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                    0%
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full gap-1 border-slate-200 dark:border-slate-700"
              >
                <BarChart3 className="h-4 w-4" />
                Ver estadísticas detalladas
              </Button>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-white">
                <Send className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                Ajustes de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enviar desde
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {campaignData.sendFromName || "Nombre no especificado"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {campaignData.sendFromEmail || "Email no especificado"}
                  </p>
                </div>
              </div>

              {campaignData.replyToEmail && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Responder a
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {campaignData.replyToEmail}
                    </p>
                  </div>
                </div>
              )}

              <Separator className="my-4 bg-slate-200 dark:bg-slate-700" />

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                  Seguimiento
                </h3>
                <div className="flex items-center gap-2">
                  {campaignData.trackOpens ? (
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Aperturas</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Aperturas</span>
                    </div>
                  )}

                  {campaignData.trackClicks ? (
                    <div className="ml-4 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Clics</span>
                    </div>
                  ) : (
                    <div className="ml-4 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Clics</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Status */}
          <Card className="border-slate-200 shadow-sm dark:border-slate-800">
            <CardHeader className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <CardTitle className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-white">
                <Clock className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                Estado de la Campaña
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Estado
                    </span>
                  </div>
                  {campaignData.status && getStatusBadge(campaignData.status)}
                </div>

                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Creada
                    </span>
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {format(new Date(campaignData.createdAt!), "PPP")}
                  </span>
                </div>

                {campaignData.scheduledAt && (
                  <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        Programada para
                      </span>
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {format(new Date(campaignData.scheduledAt), "PPP p")}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignPage;
