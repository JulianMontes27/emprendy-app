"use client";

import { useOnboarding } from "./onboarding-provider";
import { onboardingSteps } from "./onboarding-step";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";

export const OnboardingPrimaryNavigation = () => {
  const {
    currentStep,
    setCurrentStep,
    isNextStepDisabled,
    onboardingData,
    updateUser,
  } = useOnboarding();
  const { data: session } = useSession();
  const { push } = useRouter();

  const currentStepIndex = onboardingSteps.indexOf(currentStep);
  const previousStep = onboardingSteps[currentStepIndex - 1];
  const nextStep = onboardingSteps[currentStepIndex + 1];
  const isLastStep = currentStepIndex === onboardingSteps.length - 1;

  const handleSubmit = () => {
    // Trigger user update when the "Complete" button is clicked
    updateUser({
      userId: session?.user.id, // Replace with actual userId
      data: onboardingData,
      finishedOnboarding: true,
      onboardingLastUpdated: new Date(),
    });
    push("/dashboard"); // Redirect after completion (optional)
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="p-4 border-t lg:border-t-0 lg:bg-transparent">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {previousStep && (
                <button
                  onClick={() => setCurrentStep(previousStep)}
                  className="group flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (isLastStep) {
                    handleSubmit(); // Call handleSubmit when on the last step
                  } else if (nextStep) {
                    setCurrentStep(nextStep); // Move to the next step
                  }
                }}
                disabled={!!isNextStepDisabled}
                className={`
                  group relative inline-flex items-center p-2 rounded-full
                  text-sm font-semibold transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${
                    isNextStepDisabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600 shadow-sm hover:shadow"
                  }
                `}
              >
                {isLastStep ? "Complete" : "Next"}
                <ArrowRight
                  className={`
                    ml-2 h-4 w-4 transition-transform
                    ${!isNextStepDisabled && "group-hover:translate-x-1"}
                  `}
                />
              </button>
            </div>
          </div>

          {/* Optional: Show disabled message */}
          {isNextStepDisabled && (
            <p className="mt-2 text-sm text-red-500 text-center">
              {typeof isNextStepDisabled === "string"
                ? isNextStepDisabled
                : "Please complete all required fields"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
