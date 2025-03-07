"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users, Mail } from "lucide-react";
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
import { Campaign, List, Template } from "@/types/types";

interface MarketingPageClientProps {
  campaigns: Campaign[];
  templates: Template[];
  contactLists: List[];
}

const MarketingPageClient: React.FC<MarketingPageClientProps> = ({
  campaigns,
  templates,
  contactLists,
}) => {
  const { onOpen } = useModalStore();

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cold Email Marketing</h1>
        <Button onClick={() => onOpen("create-campaign", { contactLists })}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Campaigns Section */}
      {campaigns.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Opens</TableHead>
                  <TableHead>Replies</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.name}
                    </TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No campaigns found. Create one to get started.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Templates</CardTitle>
            <Button onClick={() => onOpen("create-template")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.length > 0 ? (
            templates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                onClick={() => onOpen("edit-template", { template })}
              >
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {template.description}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No templates found. Create one to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contact Management Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Contact Lists</CardTitle>
            <Button onClick={() => onOpen("import-contacts")}>
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
              {contactLists.length > 0 ? (
                contactLists.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell className="font-medium">{list.name}</TableCell>
                    <TableCell>{list.contactCount}</TableCell>
                    <TableCell>
                      {list.tags.map((tag: any) => (
                        <Badge key={tag} variant="outline" className="mr-2">
                          {tag}
                        </Badge>
                      ))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    <p className="text-sm text-muted-foreground">
                      No contact lists found. Import contacts to get started.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketingPageClient;
