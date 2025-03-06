import getSession from "@/lib/get-session";
import { notFound } from "next/navigation";
import { DataTable } from "@/components/dashboard/contacts/data-table-contacts/data-table";
import { columns } from "@/components/dashboard/contacts/data-table-contacts/columns";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { eq } from "drizzle-orm";
import ImportBtn from "@/components/dashboard/contacts/import-btn";
import CreateContactListBtn from "../_components/contacts/create-list";

const ContactsPage = async () => {
  // Get the current session
  const session = await getSession();
  const user = session?.user;
  // Redirect if the user is not logged in
  if (!user) {
    return notFound();
  }

  // Fetch contacts for the logged-in user
  const data = await db
    .select({
      id: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      email: contacts.email,
      companyName: contacts.companyName,
      jobTitle: contacts.jobTitle,
      status: contacts.status,
      tags: contacts.tags,
      createdAt: contacts.createdAt,
    })
    .from(contacts)
    .where(eq(contacts.userId, user.id)); // Query contacts for the logged-in user

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Contactos
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gestiona y organiza tus contactos de forma eficiente.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <CreateContactListBtn contacts={data} />
          <ImportBtn />
        </div>
      </div>

      {/* DataTable Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default ContactsPage;
