"use client";
import { OnboardingStepFormContent } from "./step-content";
import { OnboardingPrimaryNavigation } from "./primary-nav";
import { onboardingStepTargetName } from "./onboarding-step";
import { useOnboarding } from "./onboarding-provider";

export const OnboardingStepForm = () => {
  const { currentStep } = useOnboarding();

  return (
    <section title={onboardingStepTargetName[currentStep]}>
      <OnboardingStepFormContent />
      <OnboardingPrimaryNavigation />
    </section>
  );
};
