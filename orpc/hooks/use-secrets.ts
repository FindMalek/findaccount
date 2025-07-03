"use client"

import { orpc } from "@/orpc/client"
import type {
  CreateSecretInput,
  DeleteSecretInput,
  ListSecretsInput,
  ListSecretsOutput,
  SecretOutput,
  UpdateSecretInput,
} from "@/schemas/secrets/dto"
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"

// Query keys factory
export const secretKeys = {
  all: ["secrets"] as const,
  lists: () => [...secretKeys.all, "list"] as const,
  list: (filters: Partial<ListSecretsInput>) =>
    [...secretKeys.lists(), filters] as const,
  details: () => [...secretKeys.all, "detail"] as const,
  detail: (id: string) => [...secretKeys.details(), id] as const,
}

// Get single secret
export function useSecret(id: string) {
  return useQuery({
    queryKey: secretKeys.detail(id),
    queryFn: () => orpc.secrets.get.call({ id }),
    enabled: !!id,
  })
}

// List secrets with pagination
export function useSecrets(
  input: ListSecretsInput = { page: 1, limit: 10 },
  options?: Omit<UseQueryOptions<ListSecretsOutput>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: secretKeys.list(input),
    queryFn: () => orpc.secrets.list.call(input),
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

// Create secret mutation
export function useCreateSecret() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateSecretInput) => orpc.secrets.create.call(input),
    onSuccess: (newSecret: SecretOutput) => {
      // Invalidate and refetch secret lists
      queryClient.invalidateQueries({ queryKey: secretKeys.lists() })

      // Add the new secret to the cache
      queryClient.setQueryData(secretKeys.detail(newSecret.id), newSecret)
    },
    onError: (error) => {
      console.error("Failed to create secret:", error)
    },
  })
}

// Update secret mutation
export function useUpdateSecret() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateSecretInput) => orpc.secrets.update.call(input),
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: secretKeys.detail(input.id),
      })

      // Snapshot the previous value
      const previousSecret = queryClient.getQueryData<SecretOutput>(
        secretKeys.detail(input.id)
      )

      // Optimistically update the cache
      if (previousSecret) {
        queryClient.setQueryData<SecretOutput>(secretKeys.detail(input.id), {
          ...previousSecret,
          ...input,
        })
      }

      return { previousSecret }
    },
    onError: (error, input, context) => {
      // Rollback the cache to the previous value
      if (context?.previousSecret) {
        queryClient.setQueryData(
          secretKeys.detail(input.id),
          context.previousSecret
        )
      }
      console.error("Failed to update secret:", error)
    },
    onSuccess: (updatedSecret: SecretOutput) => {
      // Update the cache with the server response
      queryClient.setQueryData(
        secretKeys.detail(updatedSecret.id),
        updatedSecret
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: secretKeys.lists() })
    },
  })
}

// Delete secret mutation
export function useDeleteSecret() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DeleteSecretInput) => orpc.secrets.delete.call(input),
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: secretKeys.detail(input.id),
      })

      // Snapshot the previous value
      const previousSecret = queryClient.getQueryData<SecretOutput>(
        secretKeys.detail(input.id)
      )

      // Optimistically remove from cache
      queryClient.removeQueries({
        queryKey: secretKeys.detail(input.id),
      })

      return { previousSecret }
    },
    onError: (error, input, context) => {
      // Restore the cache if deletion failed
      if (context?.previousSecret) {
        queryClient.setQueryData(
          secretKeys.detail(input.id),
          context.previousSecret
        )
      }
      console.error("Failed to delete secret:", error)
    },
    onSuccess: () => {
      // Invalidate and refetch secret lists
      queryClient.invalidateQueries({ queryKey: secretKeys.lists() })
    },
  })
}
