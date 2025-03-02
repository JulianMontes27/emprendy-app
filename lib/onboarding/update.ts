import { useMutation } from "@tanstack/react-query";

type UpdateUserData = {
  userId: string;
  data: {
    businessType: string;
    primaryGoal: string;
    location: {
      country: string;
      city: string;
    };
  };
  finishedOnboarding: boolean;
  onboardingLastUpdated: Date;
};

export const useUpdateUser = () => {
  return useMutation({
    mutationKey: ["updateUser"], // Optional for debugging/tracking
    mutationFn: async (data: UpdateUserData) => {
      const response = await fetch("/api/onboarding/user-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user state");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("User updated successfully:", data);
      // Show a success message or redirect if needed
    },
    onError: (error: unknown) => {
      console.error("Error updating user:", error);
      // Optionally show a toast or error message
    },
  });
};
