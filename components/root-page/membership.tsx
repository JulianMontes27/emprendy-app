import { db } from "@/db";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Gift, Volleyball, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatPriceToCOP } from "@/utils/price-formatter";

type Membership = {
  id: string;
  name: string;
  price: string;
  ages: string;
  services: string[];
  plus: string[];
  paymentLink: string;
};

export default async function MembershipSection() {
  const memberships = await db.query.memberships.findMany().catch(() => []);

  // Cast services and plus to string arrays safely
  const formattedMemberships = memberships.map((membership: any) => ({
    ...membership,
    services: Array.isArray(membership.services) ? membership.services : [],
    plus: Array.isArray(membership.plus) ? membership.plus : [],
  }));

  // Identify the most popular plan
  const popularPlanId =
    formattedMemberships.length > 1 ? formattedMemberships[1].id : "";

  return (
    <section
      id="memberships"
      className="py-24 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">Nuestras Membresías</h2>
          <p className="text-gray-600">
            Elige el plan que mejor se adapte a tus necesidades y comienza tu
            viaje deportivo hoy mismo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {formattedMemberships.map((membership) => (
            <Card
              key={membership.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                membership.id === popularPlanId
                  ? "border-primary md:transform md:-translate-y-4 md:scale-105 z-10"
                  : "hover:-translate-y-2"
              }`}
            >
              {membership.id === popularPlanId && (
                <div className="absolute top-0 inset-x-0 bg-primary text-white text-center text-sm font-medium py-1">
                  Más Popular
                </div>
              )}

              {/* Plan Header */}
              <div
                className={`pt-8 pb-4 px-6 text-center ${
                  membership.id === popularPlanId ? "pt-12" : ""
                }`}
              >
                <Badge variant="outline" className="mb-3 px-3 py-1 text-xs">
                  {membership.ages}
                </Badge>
                <h3 className="text-2xl font-bold mb-1 text-gray-900">
                  {membership.name}
                </h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold text-primary">
                    {formatPriceToCOP(membership.price)}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">/mes</span>
                </div>
              </div>

              <CardContent className="px-6 py-4">
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <Volleyball className="w-5 h-5 mr-2 text-primary" />
                    <h4 className="font-semibold text-gray-800">
                      Servicios por Semana
                    </h4>
                  </div>
                  <ul className="space-y-2 pl-2">
                    {membership.services.map((service: any, i: number) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <Gift className="w-5 h-5 mr-2 text-primary" />
                    <h4 className="font-semibold text-gray-800">
                      Beneficios Adicionales
                    </h4>
                  </div>
                  <ul className="space-y-2 pl-2">
                    {membership.plus.map((item: any, i: number) => (
                      <li key={i} className="flex items-start">
                        <div className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 bg-yellow-100 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        </div>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="px-6 pt-2 pb-6">
                <Link
                  href={`/payment/${encodeURIComponent(membership.name)}`}
                  className={`w-full rounded-lg flex items-center justify-center py-3 px-4 font-medium transition-colors ${
                    membership.id === popularPlanId
                      ? "bg-primary hover:bg-primary/90 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  Seleccionar Plan
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional help section */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            ¿Necesitas ayuda para elegir el plan adecuado?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center font-medium text-primary hover:text-primary/80"
          >
            Contáctanos para una asesoría personalizada
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
