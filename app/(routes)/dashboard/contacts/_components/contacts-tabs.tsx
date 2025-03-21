"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/dashboard/contacts/contacts-table/data-table";
import Link from "next/link";
import { ListIcon, UsersIcon } from "lucide-react";
import { columns } from "@/components/dashboard/contacts/contacts-table/columns";
import { ListsDataTable } from "@/components/dashboard/contacts/lists/data-table";
import { columns as listsColumns } from "@/components/dashboard/contacts/lists/columns";
import { notFound, useSearchParams } from "next/navigation";

const ContactTabs = ({
  contactsData,
  listsData,
}: {
  contactsData: any[];
  listsData: any[];
}) => {
  const currentTab = useSearchParams()?.get("tab") || "contacts";
  return (
    <Tabs defaultValue={currentTab} className="w-full mb-6">
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
        <TabsTrigger value="contacts" asChild>
          <Link
            href="/dashboard/contacts?tab=contacts"
            className="flex items-center gap-2"
          >
            <UsersIcon className="h-4 w-4" />
            <span>Contactos</span>
          </Link>
        </TabsTrigger>
        <TabsTrigger value="lists" asChild>
          <Link
            href="/dashboard/contacts?tab=lists"
            className="flex items-center gap-2"
          >
            <ListIcon className="h-4 w-4" />
            <span>Listas</span>
          </Link>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="contacts" className="mt-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <DataTable columns={columns} data={contactsData} />
        </div>
      </TabsContent>

      <TabsContent value="lists" className="mt-0">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <ListsDataTable columns={listsColumns} data={listsData} />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ContactTabs;
