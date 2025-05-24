"use server"

import { headers } from "next/headers"
import { CardEntity } from "@/entities/card"
import { database } from "@/prisma/client"
import {
  CardDto,
  CardSimpleRo,
  type CardDto as CardDtoType,
} from "@/schemas/card"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { auth } from "@/lib/auth/server"
import { verifySession } from "@/lib/auth/verify"

/**
 * Create a new card
 */
export async function createCard(data: CardDtoType): Promise<{
  success: boolean
  card?: CardSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Validate using our DTO schema
    const validatedData = CardDto.parse(data)

    // Format expiry date
    const expiryDate = new Date(validatedData.expiryDate)

    try {
      // Create card with Prisma
      const card = await database.card.create({
        data: {
          ...validatedData,
          expiryDate,
          userId: session.user.id,
          createdAt: new Date(),
        },
      })

      return {
        success: true,
        card: CardEntity.getSimpleRo(card),
      }
    } catch (error) {
      throw error
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Card creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get card by ID
 */
export async function getCardById(id: string): Promise<{
  success: boolean
  card?: CardSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    const card = await database.card.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!card) {
      return {
        success: false,
        error: "Card not found",
      }
    }

    return {
      success: true,
      card: CardEntity.getSimpleRo(card),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get card error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update a card
 */
export async function updateCard(
  id: string,
  data: Partial<CardDtoType>
): Promise<{
  success: boolean
  card?: CardSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Make sure card exists and belongs to user
    const existingCard = await database.card.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingCard) {
      return {
        success: false,
        error: "Card not found",
      }
    }

    // Validate using our DTO schema (partial)
    const partialCardSchema = CardDto.partial()
    const validatedData = partialCardSchema.parse(data)

    // Format expiry date if provided
    const updateData: any = { ...validatedData }
    if (validatedData.expiryDate) {
      updateData.expiryDate = new Date(validatedData.expiryDate)
    }

    try {
      // Update card with Prisma
      const updatedCard = await database.card.update({
        where: { id },
        data: updateData,
      })

      return {
        success: true,
        card: CardEntity.getSimpleRo(updatedCard),
      }
    } catch (error) {
      throw error
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      }
    }

    console.error("Card update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete a card
 */
export async function deleteCard(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Make sure card exists and belongs to user
    const existingCard = await database.card.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingCard) {
      return {
        success: false,
        error: "Card not found",
      }
    }

    // Delete card with Prisma
    await database.card.delete({
      where: { id },
    })

    return {
      success: true,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Card deletion error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List cards with optional filtering and pagination
 */
export async function listCards(
  page = 1,
  limit = 10,
  containerId?: string
): Promise<{
  success: boolean
  cards?: CardSimpleRo[]
  total?: number
  error?: string
}> {
  try {
    const session = await verifySession()

    const skip = (page - 1) * limit

    // Build filters
    const where: Prisma.CardWhereInput = {
      userId: session.user.id,
    }

    if (containerId) {
      where.containerId = containerId
    }

    const [cards, total] = await Promise.all([
      database.card.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      database.card.count({ where }),
    ])

    return {
      success: true,
      cards: cards.map((card) => CardEntity.getSimpleRo(card)),
      total,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("List cards error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
