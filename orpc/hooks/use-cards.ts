"use client"

import { orpc } from "@/orpc/client"
import type {
  CardOutput,
  CreateCardInput,
  DeleteCardInput,
  ListCardsInput,
  ListCardsOutput,
  UpdateCardInput,
} from "@/schemas/card/dto"
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"

// Query keys factory
export const cardKeys = {
  all: ["cards"] as const,
  lists: () => [...cardKeys.all, "list"] as const,
  list: (filters: Partial<ListCardsInput>) =>
    [...cardKeys.lists(), filters] as const,
  details: () => [...cardKeys.all, "detail"] as const,
  detail: (id: string) => [...cardKeys.details(), id] as const,
}

// Get single card
export function useCard(id: string) {
  return useQuery({
    queryKey: cardKeys.detail(id),
    queryFn: () => orpc.cards.get.call({ id }),
    enabled: !!id,
  })
}

// List cards with pagination
export function useCards(
  input: ListCardsInput = { page: 1, limit: 10 },
  options?: Omit<UseQueryOptions<ListCardsOutput>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: cardKeys.list(input),
    queryFn: () => orpc.cards.list.call(input),
    placeholderData: (previousData) => previousData,
    ...options,
  })
}

// Create card mutation
export function useCreateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateCardInput) => orpc.cards.create.call(input),
    onSuccess: (newCard: CardOutput) => {
      // Invalidate and refetch card lists
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() })

      // Add the new card to the cache
      queryClient.setQueryData(cardKeys.detail(newCard.id), newCard)
    },
    onError: (error) => {
      console.error("Failed to create card:", error)
    },
  })
}

// Update card mutation
export function useUpdateCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateCardInput) => orpc.cards.update.call(input),
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: cardKeys.detail(input.id),
      })

      // Snapshot the previous value
      const previousCard = queryClient.getQueryData<CardOutput>(
        cardKeys.detail(input.id)
      )

      // Optimistically update the cache
      if (previousCard) {
        const { expiryDate, ...safeInput } = input
        queryClient.setQueryData<CardOutput>(cardKeys.detail(input.id), {
          ...previousCard,
          ...safeInput,
          ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        })
      }

      return { previousCard }
    },
    onError: (error, input, context) => {
      // Rollback the cache to the previous value
      if (context?.previousCard) {
        queryClient.setQueryData(
          cardKeys.detail(input.id),
          context.previousCard
        )
      }
      console.error("Failed to update card:", error)
    },
    onSuccess: (updatedCard: CardOutput) => {
      // Update the cache with the server response
      queryClient.setQueryData(cardKeys.detail(updatedCard.id), updatedCard)

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() })
    },
  })
}

// Delete card mutation
export function useDeleteCard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: DeleteCardInput) => orpc.cards.delete.call(input),
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: cardKeys.detail(input.id),
      })

      // Snapshot the previous value
      const previousCard = queryClient.getQueryData<CardOutput>(
        cardKeys.detail(input.id)
      )

      // Optimistically remove from cache
      queryClient.removeQueries({
        queryKey: cardKeys.detail(input.id),
      })

      return { previousCard }
    },
    onError: (error, input, context) => {
      // Restore the cache if deletion failed
      if (context?.previousCard) {
        queryClient.setQueryData(
          cardKeys.detail(input.id),
          context.previousCard
        )
      }
      console.error("Failed to delete card:", error)
    },
    onSuccess: () => {
      // Invalidate and refetch card lists
      queryClient.invalidateQueries({ queryKey: cardKeys.lists() })
    },
  })
}
