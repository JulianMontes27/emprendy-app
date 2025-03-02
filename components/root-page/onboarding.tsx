"use client";

import { Button } from "@/components/ui/button";

import useModalStore from "@/hooks/use-store-modal";

export default function Onboarding() {
  const { onOpen } = useModalStore();

  return (
    <section className="relative min-h-screen">
      <div className="h-full w-full flex flex-col items-center justify-center absolute inset-0 -z-10  px-5 py-24  gap-6 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]" />

      <div className="max-w-xl flex flex-col items-center justify-center gap-3 h-full px-5 mx-auto">
        <h1 className="font-bold md:text-5xl mb-2 text-4xl text-white">
          Bienvenido a Emprendy
        </h1>
        <p className="md:text-[15px] text-sm font-semibold text-gray-300/85 max-w-xl ">
          Copilot permite optimizar el POS de tu restaurante o establecimiento,
          mediante pagos online con codigos QR y manejo sistematico de las
          finanzas del negocio.
        </p>
        <Button
          variant={"outline"}
          className="mt-3 w-[150px]"
          onClick={() => onOpen("create-initial-restaurant")} //open the "create-initial-restaurant" modal from the modal provider
        >
          Comenzar
        </Button>
      </div>
    </section>
  );
}
