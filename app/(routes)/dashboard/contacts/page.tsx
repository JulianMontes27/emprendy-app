import getSession from "@/lib/get-session";
import { notFound } from "next/navigation";
import { DataTable } from "@/components/dashboard/contacts/data-table-contacts/data-table";
import { columns } from "@/components/dashboard/contacts/data-table-contacts/columns";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import ImportBtn from "@/components/dashboard/contacts/import-btn";

const UploadDocPage = async () => {
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
    <div className="container mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-gray-600">
            Manage and organize your contacts efficiently.
          </p>
        </div>
        <ImportBtn />
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default UploadDocPage;
