import { useQuery } from "@tanstack/react-query";

export const useAssertUserState = (userId: string | undefined) => {
  const {
    data: userState,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userState", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID is required to fetch user state");
      }

      const response = await fetch(
        `/api/onboarding/user-state?userId=${userId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user state");
      }

      return response.json();
    },
    enabled: !!userId, // Ensure query only runs if userId exists
    retry: 3, // Retry on failure (optional)
  });

  return {
    finishedOnboardingAt: userState?.finishedOnboardingAt || null,
    isLoading,
    error,
  };
};
