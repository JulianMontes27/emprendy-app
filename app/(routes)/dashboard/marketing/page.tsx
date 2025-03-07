import { db } from "@/db";
import MarketingPageClient from "./_components/client";
import { campaigns, lists, emailTemplates } from "@/db/schema";
import getSession from "@/lib/get-session";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

const MarketingPage = async () => {
  const session = await getSession();
  const user = session?.user;

  // Redirect if the user is not logged in
  if (!user || !user.id) return notFound();

  // Use a transaction to fetch all data
  const [campaignList, listList, templates] = await db.transaction(
    async (tx) => {
      const campaignList = await tx
        .select()
        .from(campaigns)
        .where(eq(campaigns.createdById, user.id!));

      const listList = await tx
        .select()
        .from(lists)
        .where(eq(lists.createdById, user.id!));

      const templates = await tx
        .select()
        .from(emailTemplates)
        .where(eq(emailTemplates.createdById, user.id!));

      return [campaignList, listList, templates];
    }
  );

  return (
    <div className="p-6 space-y-6">
      <MarketingPageClient
        templates={templates}
        campaigns={campaignList}
        contactLists={listList}
      />
    </div>
  );
};

export default MarketingPage;
