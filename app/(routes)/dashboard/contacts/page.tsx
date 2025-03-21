import getSession from "@/lib/get-session";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { contacts, lists } from "@/db/schema";
import { eq } from "drizzle-orm";
import ImportBtn from "@/components/dashboard/contacts/import-btn";
import CreateContactListBtn from "../_components/contacts/create-list";
import ContactsTabs from "./_components/contacts-tabs";
import ButtonMap from "./_components/btn-map";

const ContactsPage = async ({
  searchParams,
}: {
  searchParams: {
    tab: string;
  };
}) => {
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
    .select({})
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
          <ButtonMap
            contactsData={contactsData}
            // initialCurrentTab={currentTab}
          />
        </div>
      </div>

      {/* tabs section */}
      <ContactsTabs contactsData={contactsData} listsData={listsData} />
    </div>
  );
};

export default ContactsPage;
