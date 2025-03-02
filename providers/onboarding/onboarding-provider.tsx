"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { OnboardingStep, onboardingSteps } from "./onboarding-step";
import { useAssertUserState } from "@/hooks/use-assert-user-state";
import { useSession } from "next-auth/react";
import { useUpdateUser } from "@/lib/onboarding/update";
import { match } from "@/lib/onboarding/match";

// Define the structure of the onboarding data
type OnboardingData = {
  businessType: string;
  primaryGoal: string;
  location: {
    country: string;
    city: string;
  };
};

type OnboardingState = {
  completedSteps: OnboardingStep[];
  currentStep: OnboardingStep;
  isNextStepDisabled: string | false;
  setCurrentStep: (step: OnboardingStep) => void;
  onboardingData: OnboardingData;
  updateOnboardingData: (
    step: OnboardingStep,
    data: Partial<OnboardingData>
  ) => void;
  updateUser: (data: any) => void;
};

// Create the context with the OnboardingState type
const OnboardingContext = createContext<OnboardingState | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}

export const OnboardingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(
    onboardingSteps[0]
  );
  const [completedSteps, setCompletedSteps] = useState<OnboardingStep[]>([]);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    businessType: "",
    primaryGoal: "",
    location: { country: "", city: "" },
  });

  const { data: session } = useSession();
  const { mutate: updateUser } = useUpdateUser();
  const userId = session?.user?.id;
  const { finishedOnboardingAt } = useAssertUserState(userId || "");

  // Update a part of the onboarding data
  const updateOnboardingData = (
    step: OnboardingStep,
    data: Partial<OnboardingData>
  ) => {
    setOnboardingData((prev) => ({
      ...prev,
      ...data, // Merge the new data for the current step
    }));
  };

  const onCurrentStepChange = useCallback(
    (step: OnboardingStep) => {
      setCurrentStep(step);
      const previousStep = onboardingSteps[onboardingSteps.indexOf(step) - 1];
      if (previousStep && !completedSteps.includes(previousStep)) {
        setCompletedSteps((prev) => [...prev, previousStep]);
      }
    },
    [completedSteps]
  );

  // Determine if the next step should be disabled
  const isNextStepDisabled = useMemo(
    () =>
      match<OnboardingStep, string | false>(currentStep, {
        businessType: () => false,
        primaryGoal: () => false,
        location: () => false,
      }),
    [currentStep]
  );

  useEffect(() => {
    if (!userId || finishedOnboardingAt || isNextStepDisabled) return;

    const isLastStep =
      currentStep === onboardingSteps[onboardingSteps.length - 1];
    if (!isLastStep) return;

    // Trigger user update only at the last step
    updateUser({
      userId,
      data: onboardingData,
      finishedOnboarding: true,
      onboardingLastUpdated: new Date(),
    });
  }, [
    currentStep,
    finishedOnboardingAt,
    isNextStepDisabled,
    userId,
    onboardingData,
    updateUser,
  ]);

  if (!userId) return <div>Loading...</div>;

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        setCurrentStep: onCurrentStepChange,
        completedSteps,
        isNextStepDisabled,
        onboardingData,
        updateOnboardingData,
        updateUser, // Pass the updateUser function to the context
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
