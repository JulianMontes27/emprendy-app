import getSession from "@/lib/get-session";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { subscriptions } from "@/db/schema";

const ClientPage: React.FC = async ({}) => {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return null;
  }

  // Fetch the user's subscription
  const subscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .catch((error) => {
      console.error("Error fetching subscription:", error);
      return null;
    });

  // If no subscription is found, handle it appropriately
  if (!subscription || subscription.length === 0) {
    return (
      <section className="w-full flex flex-col items-center justify-center bg-gradient-to-b text-white p-4">
        <p>No active subscription found.</p>
      </section>
    );
  }

  // Use the subscription data
  const activeSubscription = subscription[0];

  return (
    <section className="w-full flex flex-col items-center justify-center bg-gradient-to-b text-black p-4">
      <h1 className="text-2xl font-bold">Tu suscripción</h1>
      <p>
        Estado: {activeSubscription.status === "active" ? "Activa" : "Renovar"}
      </p>
      <p>Fecha comienzo: {activeSubscription.startDate.toLocaleDateString()}</p>
      <p>
        Fecha vencimiento: {activeSubscription.endDate?.toLocaleDateString()}
      </p>
    </section>
  );
};

export default ClientPage;
