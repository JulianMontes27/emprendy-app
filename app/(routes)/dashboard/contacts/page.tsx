import getSession from "@/lib/get-session";
import { redirect } from "next/navigation";
import { DataTable } from "@/components/dashboard/contacts/contacts-table/data-table";
import { columns } from "@/components/dashboard/contacts/contacts-table/columns";
import { db } from "@/db";
import { contacts, lists } from "@/db/schema";
import { eq } from "drizzle-orm";
import ImportBtn from "@/components/dashboard/contacts/import-btn";
import CreateContactListBtn from "../_components/contacts/create-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListsDataTable } from "@/components/dashboard/contacts/lists/data-table";
import { columns as listColumns } from "@/components/dashboard/contacts/lists/columns";

import { UsersIcon, ListIcon } from "lucide-react";
import Link from "next/link";

const ContactsPage = async ({
  searchParams,
}: {
  searchParams: {
    tab: string;
  };
}) => {
  // Get current tab from URL or default to "contacts"
  const currentTab = searchParams?.tab || "contacts";

  // Get the current session
  const session = await getSession();
  const user = session?.user;

  // Redirect if the user is not logged in
  if (!user || !user.id) {
    return redirect("/api/auth/signin");
  }

  // Fetch Contacts of the logged-in User
  const contactsData = await db
    .select()
    .from(contacts)
    .where(eq(contacts.userId, user.id));

  // Fetch Lists of the logged-in User
  const listsData = await db
    .select({
      id: lists.id,
      name: lists.name,
      isActive: lists.isActive,
      createdAt: lists.createdAt,
    })
    .from(lists)
    .where(eq(lists.createdById, user.id));

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Gestión de Contactos
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Organiza y administra tus contactos y listas de distribución.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {currentTab === "contacts" ? (
            <>
              <ImportBtn />
            </>
          ) : (
            <CreateContactListBtn contacts={contactsData} />
          )}
        </div>
      </div>

      {/* Tabs Section */}
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
            <ListsDataTable columns={listColumns} data={listsData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactsPage;
