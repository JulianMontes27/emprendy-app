import { OnboardingOverview } from "./overview";
import { OnboardingStepForm } from "./step-form";

const Onboarding = () => {
  return (
    <div className="max-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-gray-200">
          {/* Left side - Overview */}
          <div className="w-full lg:w-1/2 p-6">
            <div className="max-w-xl mx-auto">
              <OnboardingOverview />
            </div>
          </div>

          {/* Right side - Step Form */}
          <div className="w-full lg:w-1/2 p-6">
            <div className="max-w-xl mx-auto">
              <OnboardingStepForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
