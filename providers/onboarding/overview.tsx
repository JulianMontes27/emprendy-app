"use client";
import React from "react";
import { useOnboarding } from "@/providers/onboarding/onboarding-provider";
import { onboardingStepTargetName, onboardingSteps } from "./onboarding-step";
import { without } from "@/lib/onboarding/without";
import { Check, ChevronRight } from "lucide-react";
import UserButton from "@/components/auth/user-button";
import { useSession } from "next-auth/react";

export const OnboardingOverview = () => {
  const { currentStep, setCurrentStep, completedSteps } = useOnboarding();
  const { data: session } = useSession();

  return (
    <section className="p-6 border border-gray-200 rounded-lg shadow-sm">
      <div className="w-full items-center flex flex-row justify-end mb-2">
        <UserButton user={session?.user!} />
      </div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Quick Setup</h2>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">
            {completedSteps.length} / {onboardingSteps.length} steps
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {onboardingSteps.map((step) => {
          const isCompleted = completedSteps.includes(step);
          const isCurrent = currentStep === step;
          const isEnabled =
            isCompleted ||
            without(onboardingSteps, ...completedSteps)[0] === step;

          return (
            <button
              key={step}
              onClick={() => isEnabled && setCurrentStep(step)}
              disabled={!isEnabled}
              className={`
                group flex items-center justify-between w-full px-4 py-3 rounded-lg
                transition-all duration-200 text-left
                ${
                  isCurrent
                    ? "bg-blue-500 text-white ring-2 ring-blue-500 ring-offset-2"
                    : isCompleted
                    ? "bg-gray-50 text-gray-500"
                    : "bg-gray-50 text-gray-900"
                }
                ${
                  isEnabled
                    ? "hover:bg-blue-400 hover:text-white cursor-pointer"
                    : "opacity-60 cursor-not-allowed"
                }
              `}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  flex items-center justify-center w-6 h-6 rounded-full
                  ${
                    isCurrent
                      ? "bg-white text-blue-500"
                      : isCompleted
                      ? "bg-blue-100 text-blue-500"
                      : "bg-gray-200 text-gray-500"
                  }
                `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">
                      {onboardingSteps.indexOf(step) + 1}
                    </span>
                  )}
                </div>
                <span
                  className={`font-medium ${isCompleted ? "line-through" : ""}`}
                >
                  {onboardingStepTargetName[step]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default OnboardingOverview;
