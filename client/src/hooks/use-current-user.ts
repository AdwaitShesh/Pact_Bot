import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await api.get("/auth/current-user");
      return response.data;
    },
  });

  return {
    user,
    isLoading,
    error,
  };
}
