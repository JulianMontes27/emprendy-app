import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, MapPin, Calendar, ArrowUpRight } from "lucide-react";
import Collage from "./collage";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import MembershipSection from "./membership";
import { SignInBtn } from "../auth/signin-btn";
import LandingHeader from "./landing-header";

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  description?: string;
  component?: React.ReactNode;
}

const features: FeatureCard[] = [
  {
    icon: CheckCircle,
    title: "Entrenadores Profesionales",
    component: (
      <p>
        Nuestros{" "}
        <a className="font-bold cursor-pointer text-slate-800" href="#coaches">
          entrenadores certificados
        </a>{" "}
        te ayudarán a mejorar tu juego
      </p>
    ),
  },
  {
    icon: MapPin,
    title: "Ubicación",
    component: (
      <div>
        Canchas estratégicamente ubicadas en Bocagrande, junto al <br />
        <Link
          target="_blank"
          href="https://www.eluniversal.com.co/cartagena/2025/01/08/transformacion-de-el-laguito-disenos-del-nuevo-proyecto-urbano-de-cartagena/"
          className="text-green-600 hover:underline"
        >
          Proyecto de Transformación del Laguito
        </Link>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1962.1570212630993!2d-75.55980859495422!3d10.396613050668037!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef62f13845a35df%3A0xa8a697c1918d40a6!2sBocagrande%2C%20Cartagena%2C%20Cartagena%20Province%2C%20Bolivar!5e0!3m2!1sen!2sco!4v1739820548375!5m2!1sen!2sco"
          className="b-0 h-full w-full"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    ),
  },
  {
    icon: Calendar,
    title: "Horarios",
    description: "Horarios flexibles que se ajustan a tu comodidad.",
  },
];

/* This route is statically rendered on the server and sent with JS to the client browser to hydrate the interactive parts */
export default function EscuelaDeTenisLanding() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <LandingHeader />
      <main className="flex-grow sm:mt-9 mt-4">
        {/* Hero Section */}
        <section className="py-12 bg-gray-100">
          <Collage />
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">
              Sobre la Escuela
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <feature.icon className="w-12 h-12 text-green-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    {feature.description && (
                      <p className="text-gray-600">{feature.description}</p>
                    )}
                    {feature.component && (
                      <div className="mt-2">{feature.component}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Coaches Section */}
        <section id="coaches" className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">
              Nuestros Entrenadores Profesionales
            </h2>
            <div className="flex flex-col gap-2 sm:grid grid-cols-2 ">
              {[
                {
                  name: "Nerio Rodriguez Realez",
                  image: "/placeholder.svg?height=300&width=300",
                  title: "Entrenador Principal",
                  certifications: [
                    "Entrenador Deportivo (Técnico - 25 años de experiencia",
                  ],
                  experience: "15 años de experiencia",
                  specialties: ["Técnica avanzada", "Estrategia de juego"],
                  bio: "Juan ha entrenado a jugadores de todos los niveles, desde principiantes hasta profesionales. Su enfoque se centra en desarrollar una técnica sólida y una mentalidad ganadora.",
                  email: "nerio846@gmail.com",
                  resume: "/public-assets/HOJA DE VIDA NERIO.pdf",
                },
              ].map((coach, index) => (
                <Card
                  key={index}
                  className="overflow-hidden flex flex-col justify-center items-center"
                >
                  <Image
                    src={coach.image}
                    alt={coach.name}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{coach.name}</h3>
                    <p className="text-gray-600 mb-4 flex flex-row">
                      {coach.title}{" "}
                      <Link href={coach.resume}>
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>{" "}
                    </p>
                    <div className="mb-4">
                      {coach.certifications.map((cert, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="mr-2 mb-2"
                        >
                          {cert}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {coach.experience}
                    </p>
                    <h4 className="font-semibold mt-4 mb-2">Especialidades:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
                      {coach.specialties.map((specialty, i) => (
                        <li key={i}>{specialty}</li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-600">{coach.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="p-16 bg-green-600 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para unirte?</h2>
          <p className="text-lg mb-6">
            Disfruta del tenis en una comunidad acogedora.
          </p>
          <SignInBtn
            className={
              "bg-white text-black w-full max-w-2xl mx-auto px-4 py-2 hover:bg-gray-100 transition-colors"
            }
          >
            Únete ahora
          </SignInBtn>
        </section>
      </main>
      {/* Membresias */}
      <MembershipSection />
      {/* Footer */}
      <footer id="contact" className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <p>
              Cra. sexta al lado de las instalaciones del Inderena y la boca del
              Laguito
            </p>
            <p>Cartagena, Colombia</p>
            <p>317-3973379</p>
            <p>nerio846@gmail.com</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-green-400">
                  Membresía
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-green-400">
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-green-400">
                  Lecciones
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-green-400">
                  Sobre Nosotros
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
