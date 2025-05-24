"use server"

import { SecretEntity } from "@/entities/secret"
import { database } from "@/prisma/client"
import {
  SecretDto,
  SecretSimpleRo,
  type SecretDto as SecretDtoType,
} from "@/schemas/secret"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"

/**
 * Create a new secret
 */
export async function createSecret(data: SecretDtoType): Promise<{
  success: boolean
  secret?: SecretSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Validate using our DTO schema
    const validatedData = SecretDto.parse(data)

    // Format expiry date if provided
    const secretData: any = { ...validatedData }
    if (validatedData.expiresAt) {
      secretData.expiresAt = new Date(validatedData.expiresAt)
    }

    try {
      // Check if platform exists
      const platform = await database.platform.findUnique({
        where: { id: validatedData.platformId },
      })

      if (!platform) {
        return {
          success: false,
          error: "Platform not found",
        }
      }

      // Create secret with Prisma
      const secret = await database.secret.create({
        data: {
          ...secretData,
          userId: session.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        secret: SecretEntity.getSimpleRo(secret),
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

    console.error("Secret creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get secret by ID
 */
export async function getSecretById(id: string): Promise<{
  success: boolean
  secret?: SecretSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    const secret = await database.secret.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!secret) {
      return {
        success: false,
        error: "Secret not found",
      }
    }

    return {
      success: true,
      secret: SecretEntity.getSimpleRo(secret),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get secret error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update a secret
 */
export async function updateSecret(
  id: string,
  data: Partial<SecretDtoType>
): Promise<{
  success: boolean
  secret?: SecretSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Make sure secret exists and belongs to user
    const existingSecret = await database.secret.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingSecret) {
      return {
        success: false,
        error: "Secret not found",
      }
    }

    // Validate using our DTO schema (partial)
    const partialSecretSchema = SecretDto.partial()
    const validatedData = partialSecretSchema.parse(data)

    // Format expiry date if provided
    const updateData: any = { ...validatedData, updatedAt: new Date() }
    if (validatedData.expiresAt) {
      updateData.expiresAt = new Date(validatedData.expiresAt)
    }

    try {
      // Update secret with Prisma
      const updatedSecret = await database.secret.update({
        where: { id },
        data: updateData,
      })

      return {
        success: true,
        secret: SecretEntity.getSimpleRo(updatedSecret),
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

    console.error("Secret update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete a secret
 */
export async function deleteSecret(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Make sure secret exists and belongs to user
    const existingSecret = await database.secret.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingSecret) {
      return {
        success: false,
        error: "Secret not found",
      }
    }

    // Delete secret with Prisma
    await database.secret.delete({
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
    console.error("Secret deletion error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List secrets with optional filtering and pagination
 */
export async function listSecrets(
  page = 1,
  limit = 10,
  containerId?: string,
  platformId?: string
): Promise<{
  success: boolean
  secrets?: SecretSimpleRo[]
  total?: number
  error?: string
}> {
  try {
    const session = await verifySession()

    const skip = (page - 1) * limit

    // Build filters
    const where: Prisma.SecretWhereInput = {
      userId: session.user.id,
    }

    if (containerId) {
      where.containerId = containerId
    }

    if (platformId) {
      where.platformId = platformId
    }

    const [secrets, total] = await Promise.all([
      database.secret.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      database.secret.count({ where }),
    ])

    return {
      success: true,
      secrets: secrets.map((secret) => SecretEntity.getSimpleRo(secret)),
      total,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("List secrets error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
