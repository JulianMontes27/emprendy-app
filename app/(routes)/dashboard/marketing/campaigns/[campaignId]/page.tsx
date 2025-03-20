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
} from "lucide-react";
import { format } from "date-fns";
import type { Contact } from "@/types/types";
import StartCampaignButton from "../../_components/start-campaign-client";
import EditEmailContent from "../../_components/edit-email-content";
import Link from "next/link";

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
          <Badge variant="outline" className="bg-gray-100">
            Borrador
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Programada
          </Badge>
        );
      case "sending":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800">
            Enviando
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Enviada
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
    <div className="container mx-auto py-8 space-y-8 max-w-6xl">
      {/* Campaign Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-950 p-6 rounded-lg shadow-sm border">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{campaignData.name}</h1>
            {campaignData.status && getStatusBadge(campaignData.status)}
          </div>
          <p className="text-muted-foreground">
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
        <div className="flex items-center gap-3">
          <div className="bg-primary-50 dark:bg-primary-950 text-primary px-4 py-2 rounded-md flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-medium">
              {totalRecipients}{" "}
              <span className="text-sm text-gray-400">destinatarios</span>
            </span>
          </div>
          <StartCampaignButton
            campaign={campaignData}
            template={templateData}
            contacts={groupedContacts.flatMap((list) => list.contacts)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Content */}
          <EditEmailContent campaignData={campaignData} />
          {templateData && (
            <>
              <Separator />
              <Link
                href={`/dashboard/marketing/campaigns/templates/${templateData.id}`}
                className="group flex items-center gap-3 p-2 -mx-2 transition-all duration-300 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/30 relative overflow-hidden"
              >
                <div className="p-2 bg-primary-50 dark:bg-primary-900 rounded-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm group-hover:bg-primary-100 dark:group-hover:bg-primary-800 relative z-10">
                  <Mail className="h-4 w-4 text-primary transition-all duration-300 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
                </div>
                <div className="transition-all duration-300 group-hover:translate-x-1">
                  <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground/80">
                    Plantilla
                  </p>
                  <p className="font-medium transition-colors duration-300 group-hover:text-primary">
                    {templateData.name}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-100/0 to-primary-100/0 dark:via-primary-900/0 dark:to-primary-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:via-primary-100/10 group-hover:to-primary-100/5 dark:group-hover:via-primary-900/10 dark:group-hover:to-primary-900/5"></div>
              </Link>
            </>
          )}
          {/* Associated Lists */}
          <Card>
            <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Listas de Contactos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {groupedContacts.length > 0 ? (
                <div className="space-y-6">
                  {groupedContacts.map((list) => (
                    <div key={list.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary-50 dark:bg-primary-900 rounded-md">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-medium">{list.name}</h3>
                        <Badge variant="outline">
                          {list.contacts.length} contactos
                        </Badge>
                      </div>
                      <div className="pl-10 grid gap-2">
                        {list.contacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900"
                          >
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-medium">
                              {contact.firstName} {contact.lastName}
                            </span>
                            <span className="text-muted-foreground">
                              {contact.email}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No hay listas asociadas a esta campaña.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Email Settings */}
          <Card>
            <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b">
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Ajustes de Envío
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-50 dark:bg-primary-900 rounded-md mt-0.5">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enviar desde</p>
                  <p className="font-medium">{campaignData.sendFromName}</p>
                  <p className="text-sm text-muted-foreground">
                    {campaignData.sendFromEmail}
                  </p>
                </div>
              </div>

              {campaignData.replyToEmail && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900 rounded-md mt-0.5">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Responder a</p>
                    <p className="font-medium">{campaignData.replyToEmail}</p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Seguimiento</h3>
                <div className="flex items-center gap-2">
                  {campaignData.trackOpens ? (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Aperturas</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Aperturas</span>
                    </div>
                  )}

                  {campaignData.trackClicks ? (
                    <div className="flex items-center gap-1.5 text-green-600 ml-4">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Clics</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground ml-4">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Clics</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Status */}
          <Card>
            <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Estado de la Campaña
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Estado</span>
                  </div>
                  {campaignData.status && getStatusBadge(campaignData.status)}
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Creada</span>
                  </div>
                  <span className="font-medium">
                    {format(new Date(campaignData.createdAt!), "PPP")}
                  </span>
                </div>

                {campaignData.scheduledAt && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      <span>Programada para</span>
                    </div>
                    <span className="font-medium">
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
