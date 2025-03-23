"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable } from "@/components/dashboard/contacts/contacts-table/data-table";
import Link from "next/link";
import { ListIcon, UsersIcon } from "lucide-react";
import { columns } from "@/components/dashboard/contacts/contacts-table/columns";
import { ListsDataTable } from "@/components/dashboard/contacts/lists/data-table";
import { columns as listsColumns } from "@/components/dashboard/contacts/lists/columns";
import { useSearchParams } from "next/navigation";

const ContactTabs = ({
  contactsData,
  listsData,
}: {
  contactsData: any[];
  listsData: any[];
}) => {
  const currentTab = useSearchParams()?.get("tab") || "contacts";

  return (
    <Tabs defaultValue={currentTab} className="w-full">
      <TabsList className="mb-6 inline-flex h-10 items-center justify-start rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
        <TabsTrigger
          value="contacts"
          asChild
          className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100"
        >
          <Link
            href="/dashboard/contacts?tab=contacts"
            className="flex items-center gap-2"
          >
            <UsersIcon className="h-4 w-4" />
            <span>Contactos</span>
          </Link>
        </TabsTrigger>
        <TabsTrigger
          value="lists"
          asChild
          className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-slate-100"
        >
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
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <DataTable columns={columns} data={contactsData} />
        </div>
      </TabsContent>

      <TabsContent value="lists" className="mt-0">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ListsDataTable columns={listsColumns} data={listsData} />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ContactTabs;
