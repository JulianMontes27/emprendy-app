export const onboardingSteps = [
  "businessType",
  "primaryGoal",
  "location",
] as const;
export type OnboardingStep = (typeof onboardingSteps)[number];

export const onboardingStepTargetName: Record<OnboardingStep, string> = {
  businessType: "Define tu tipo de negocio",
  primaryGoal: "Describe cual es tu objetivo primario",
  location: "¿En que pais esta basado tu negocio?",
};
