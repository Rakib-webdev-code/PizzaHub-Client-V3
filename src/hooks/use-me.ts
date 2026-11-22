"use client";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";
import type { Me, Role } from "@/lib/types";

// `me` comes from the Express API (database truth); the Better Auth session only tells us who is signed in.
export function useMe() {
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const q = useQuery({
    queryKey: ["me", userId],
    queryFn: () => api<Me>("/api/users/me"),
    enabled: !!userId,
    retry: false,
    staleTime: 60_000,
  });
  return {
    session,
    me: q.data,
    role: q.data?.role as Role | undefined,
    isAuthed: !!userId,
    loading: isPending || (!!userId && q.isLoading),
    error: q.error,
    refetch: q.refetch,
  };
}
