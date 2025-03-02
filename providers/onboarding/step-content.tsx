"use client";

import React, { useState } from "react";
import { useOnboarding } from "./onboarding-provider";
import { cn } from "@/lib/utils";

type MatchProps<T extends string | number | symbol> = {
  value: T;
  cases: Record<T, () => JSX.Element>;
};

export const Match = <T extends string | number | symbol>({
  value,
  cases,
}: MatchProps<T>) => {
  const CaseComponent = cases[value];
  if (CaseComponent) {
    return CaseComponent();
  }
  throw new Error(`No match found for value: ${String(value)}`);
};

const BusinessTypeOnboardingStep = () => {
  const { updateOnboardingData, onboardingData } = useOnboarding();

  const handleSelectBusinessType = (type: string) => {
    updateOnboardingData("businessType", { businessType: type });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          Selecciona el tamaño de tu negocio
        </h2>
        <p className="text-gray-600">
          Escoge la opción que más se ajuste a tu empresa
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 w-full">
        {[
          {
            title: "Pequeño Negocio",
            desc: "Para empresas con menos de 50 empleados",
            type: "Small Business",
          },
          {
            title: "Empresa Grande",
            desc: "Para organizaciones con más de 50 empleados",
            type: "Enterprise",
          },
        ].map((option) => (
          <div
            key={option.type}
            className={cn(
              "flex flex-row w-full border border-gray-200 rounded-lg hover:scale-105 transition-transform",
              onboardingData.businessType === option.type && "border-green-600"
            )}
          >
            <button
              onClick={() => handleSelectBusinessType(option.type)}
              className="flex flex-col p-6 text-left hover:border-blue-500 hover:shadow-md transition-all w-full"
            >
              <h3 className="text-lg font-medium text-gray-900">
                {option.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{option.desc}</p>
            </button>
            <div className="flex items-center justify-center pr-4">
              <div
                className={cn(
                  "h-5 w-5 rounded-full border border-black bg-gray-200 transition-colors cursor-pointer",
                  onboardingData.businessType === option.type && "bg-green-600"
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const PrimaryGoalOnboardingStep = () => {
  const { updateOnboardingData } = useOnboarding();

  const handleSelectGoal = (goal: string) => {
    updateOnboardingData("primaryGoal", { primaryGoal: goal });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          ¿Cuál es tu objetivo principal?
        </h2>
        <p className="text-gray-600">Ayúdanos a entender qué deseas lograr</p>
      </div>
      <div className="space-y-4">
        {[
          {
            title: "Aumentar Ingresos",
            desc: "Impulsa tus ventas y aumenta tus ganancias",
          },
          {
            title: "Reducir Costos",
            desc: "Optimiza gastos y mejora la eficiencia",
          },
          {
            title: "Mejorar Operaciones",
            desc: "Optimiza procesos y flujo de trabajo",
          },
        ].map((goal) => (
          <button
            key={goal.title}
            onClick={() => handleSelectGoal(goal.title)}
            className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md hover:scale-105 transition-all"
          >
            <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{goal.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

const LocationOnboardingStep = () => {
  const { updateOnboardingData } = useOnboarding();
  const [location, setLocation] = useState({ country: "", city: "" });

  const handleChangeLocation = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLocation((prev) => {
      const newLocation = { ...prev, [name]: value };
      updateOnboardingData("location", { location: newLocation });
      return newLocation;
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">
          ¿Dónde estás ubicado?
        </h2>
        <p className="text-gray-600">
          Cuéntanos sobre la ubicación de tu negocio
        </p>
      </div>
      <form className="space-y-4">
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700"
          >
            País
          </label>
          <select
            id="country"
            name="country"
            value={location.country}
            onChange={handleChangeLocation}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option>Estados Unidos</option>
            <option>Canadá</option>
            <option>Reino Unido</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700"
          >
            Ciudad
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={location.city}
            onChange={handleChangeLocation}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ingresa tu ciudad"
          />
        </div>
      </form>
    </div>
  );
};

export const OnboardingStepFormContent = () => {
  const { currentStep } = useOnboarding();

  return (
    <div className="max-w-2xl mx-auto">
      <Match
        value={currentStep}
        cases={{
          businessType: () => <BusinessTypeOnboardingStep />,
          primaryGoal: () => <PrimaryGoalOnboardingStep />,
          location: () => <LocationOnboardingStep />,
        }}
      />
    </div>
  );
};
