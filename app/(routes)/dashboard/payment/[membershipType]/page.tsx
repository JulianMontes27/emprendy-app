import { db } from "@/db";
import { CheckCircle, Gift, ArrowLeft, Shield, Star } from "lucide-react";
import { formatPriceToCOP } from "@/utils/price-formatter";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import getSession from "@/lib/get-session";
import MPPagar from "@/components/payments/mp-pagar";
import { memberships, subscriptions } from "@/db/schema";
import { Membership } from "@/types/types";

export const metadata = {
  title: "Confirmar Suscripción",
  description: "Revisa y confirma los detalles de tu membresía",
};

export default async function PaymentPageByType({
  params,
}: {
  params: {
    membershipType: string;
  };
}) {
  // User has to be logged in to be able to subscribe to a Membership
  const session = await getSession();
  const user = session?.user;
  if (!user) {
    return redirect(`/api/auth/signin`);
  }

  // Fetch membership and subscription data in parallel
  const [membershipResults, userSubscription] = await Promise.all([
    db
      .select()
      .from(memberships)
      .where(eq(memberships.name, params.membershipType))
      .catch(() => []), // Handle DB errors gracefully
    db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, user.id))
      .catch(() => []), // Handle DB errors gracefully
  ]);

  // If no membership is found, use Next.js notFound
  if (!membershipResults.length) {
    notFound();
  }

  // If the user already has an active subscription, redirect
  if (userSubscription[0]?.status === "active") {
    notFound();
  }

  // Get the first membership from the results array
  const membershipData = membershipResults[0];

  // Cast services and plus to string arrays
  const membership = {
    ...membershipData,
    services: Array.isArray(membershipData.services)
      ? membershipData.services
      : [],
    plus: Array.isArray(membershipData.plus) ? membershipData.plus : [],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header with back button */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/#membresias"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a Membresías
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Page title */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Confirmar Suscripción
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Revisa los detalles de tu plan antes de continuar
          </p>

          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Colored header */}
            <div className="bg-primary bg-opacity-95 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 mb-2">
                    Plan Recomendado
                  </span>
                  <h2 className="text-2xl font-bold">{membership.name}</h2>
                  <p className="opacity-90 text-sm mt-1">
                    Para edades: {membership.ages}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {formatPriceToCOP(membership.price)}
                  </div>
                  <div className="text-sm opacity-90">por mes</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Services */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-primary" />
                    Servicios Incluidos
                  </h3>
                  <ul className="space-y-3">
                    {membership.services.map((service, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Additional Benefits */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Gift className="w-5 h-5 mr-2 text-yellow-500" />
                    Beneficios Adicionales
                  </h3>
                  <ul className="space-y-3">
                    {membership.plus.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <div className="bg-yellow-100 p-1 rounded-full mr-3 flex-shrink-0 mt-0.5">
                          <Gift className="w-4 h-4 text-yellow-600" />
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Secure purchase note */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg flex items-center text-sm text-gray-600">
                <Shield className="w-5 h-5 mr-2 text-gray-500" />
                Pago 100% seguro procesado por MercadoPago. No almacenamos tu
                información de pago.
              </div>

              {/* Payment Section */}
              <div className="mt-6">
                <MPPagar user={user} membership={membership} />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 text-center text-sm text-gray-500 border-t border-gray-100">
              ¿Tienes preguntas? Contáctanos al{" "}
              <a
                href="tel:+573001234567"
                className="text-primary hover:underline"
              >
                300 123 4567
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
