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
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Mail, Send, Users } from "lucide-react";
import { format } from "date-fns";
import StartCampaignButton from "../../_components/start-campaign-btn";
import { Contact } from "@/types/types";

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
    // For each row in the array, the code checks if the listId already exists in the accumulator (acc). If it doesn’t, it initializes a new entry for that list.
    if (!acc[row.listId]) {
      acc[row.listId] = {
        id: row.listId,
        name: row.listName,
        contacts: [],
      };
    }
    // Once the list is initialized (or if it already exists), the contact is added to the contacts array for that list.
    acc[row.listId].contacts.push({
      id: row.contactId,
      email: row.contactEmail,
      firstName: row.contactFirstName,
      lastName: row.contactLastName,
    });
    return acc;
  }, {} as Record<string, { id: string; name: string; contacts: Contact[] }>); // acc is initialized with {};

  // The Object.values() function is used to convert the grouped object into an array of lists with their contacts.
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

  return (
    <div className="p-6 space-y-6">
      {/* Campaign Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{campaignData.name}</h1>
        <div className="flex items-center space-x-4">
          <StartCampaignButton
            campaign={campaignData}
            template={templateData}
            contacts={groupedContacts.flatMap((list) => list.contacts)}
          />
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Creada</p>
              <p className="font-medium">
                {format(new Date(campaignData.createdAt!), "PPP")}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Clock className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <p className="font-medium">{campaignData.status}</p>
            </div>
          </div>
          {campaignData.scheduledAt && (
            <div className="flex items-center space-x-4">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Programada para</p>
                <p className="font-medium">
                  {format(new Date(campaignData.scheduledAt), "PPP p")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Ajustes de correp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Enviar desde</p>
              <p className="font-medium">
                {campaignData.sendFromName} ({campaignData.sendFromEmail})
              </p>
            </div>
          </div>
          {campaignData.replyToEmail && (
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Responder a</p>
                <p className="font-medium">{campaignData.replyToEmail}</p>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-4">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Seguimiento</p>
              <p className="font-medium">
                {campaignData.trackOpens
                  ? "Opens Tracked"
                  : "Opens Not Tracked"}
                ,{" "}
                {campaignData.trackClicks
                  ? "Clicks Tracked"
                  : "Clicks Not Tracked"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Contenido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Tema</p>
            <p className="font-medium">{campaignData?.settings?.subject}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cuerpo del email</p>
            <div
              className="prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{
                __html: campaignData?.settings?.emailBody,
              }}
            />
          </div>
          {templateData && (
            <div>
              <p className="text-sm text-gray-500">Template</p>
              <p className="font-medium">{templateData.name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Associated Lists */}
      <Card>
        <CardHeader>
          <CardTitle>Listas asociadas</CardTitle>
        </CardHeader>
        <CardContent>
          {groupedContacts.length > 0 ? (
            <ul className="space-y-4">
              {groupedContacts.map((list) => (
                <li key={list.id}>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{list.name}</span>
                  </div>
                  <ul className="pl-6 mt-2 space-y-2">
                    {list.contacts.map((contact) => (
                      <li key={contact.id} className="text-sm text-gray-600">
                        {contact.firstName} {contact.lastName} ({contact.email})
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">
              No hay listas asociadas a esta campaña.{" "}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignPage;
