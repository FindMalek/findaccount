"use client"

import { orpc } from "@/orpc/client"
import type {
  ListPlatformsInput,
  ListPlatformsOutput,
} from "@/schemas/utils/dto"
import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

// Query keys factory
export const platformKeys = {
  all: ["platforms"] as const,
  lists: () => [...platformKeys.all, "list"] as const,
  list: (filters: Partial<ListPlatformsInput>) =>
    [...platformKeys.lists(), filters] as const,
}

// List platforms with pagination
export function usePlatforms(
  input: ListPlatformsInput = { page: 1, limit: 100 },
  options?: Omit<UseQueryOptions<ListPlatformsOutput>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: platformKeys.list(input),
    queryFn: () => orpc.platforms.list.call(input),
    placeholderData: (previousData) => previousData,
    ...options,
  })
}
