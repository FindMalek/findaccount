"use server"

import { headers } from "next/headers"
import { PlatformEntity } from "@/entities/platform"
import { database } from "@/prisma/client"
import {
  PlatformDto,
  PlatformSimpleRo,
  type PlatformDto as PlatformDtoType,
} from "@/schemas/platform"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { auth } from "@/lib/auth/server"
import { verifySession } from "@/lib/auth/verify"

/**
 * Create a new platform
 */
export async function createPlatform(data: PlatformDtoType): Promise<{
  success: boolean
  platform?: PlatformSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Validate using our DTO schema
    const validatedData = PlatformDto.parse(data)

    try {
      // Create platform with Prisma
      const platform = await database.platform.create({
        data: {
          ...validatedData,
          userId: session.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        platform: PlatformEntity.getSimpleRo(platform),
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

    console.error("Platform creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get platform by ID
 */
export async function getPlatformById(id: string): Promise<{
  success: boolean
  platform?: PlatformSimpleRo
  error?: string
}> {
  try {
    const platform = await database.platform.findUnique({
      where: { id },
    })

    if (!platform) {
      return {
        success: false,
        error: "Platform not found",
      }
    }

    return {
      success: true,
      platform: PlatformEntity.getSimpleRo(platform),
    }
  } catch (error) {
    console.error("Get platform error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update a platform
 */
export async function updatePlatform(
  id: string,
  data: Partial<PlatformDtoType>
): Promise<{
  success: boolean
  platform?: PlatformSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Make sure platform exists
    const existingPlatform = await database.platform.findUnique({
      where: { id },
    })

    if (!existingPlatform) {
      return {
        success: false,
        error: "Platform not found",
      }
    }

    // Check ownership if platform has an owner
    if (
      existingPlatform.userId &&
      existingPlatform.userId !== session.user.id
    ) {
      return {
        success: false,
        error: "Not authorized to update this platform",
      }
    }

    // Validate using our DTO schema (partial)
    const partialPlatformSchema = PlatformDto.partial()
    const validatedData = partialPlatformSchema.parse(data)

    try {
      // Update platform with Prisma
      const updatedPlatform = await database.platform.update({
        where: { id },
        data: {
          ...validatedData,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        platform: PlatformEntity.getSimpleRo(updatedPlatform),
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

    console.error("Platform update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete a platform
 */
export async function deletePlatform(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Make sure platform exists
    const existingPlatform = await database.platform.findUnique({
      where: { id },
    })

    if (!existingPlatform) {
      return {
        success: false,
        error: "Platform not found",
      }
    }

    // Check ownership if platform has an owner
    if (
      existingPlatform.userId &&
      existingPlatform.userId !== session.user.id
    ) {
      return {
        success: false,
        error: "Not authorized to delete this platform",
      }
    }

    // Check if platform is in use
    const [credentialCount, secretCount] = await Promise.all([
      database.credential.count({ where: { platformId: id } }),
      database.secret.count({ where: { platformId: id } }),
    ])

    if (credentialCount > 0 || secretCount > 0) {
      return {
        success: false,
        error:
          "Cannot delete platform that is in use by credentials or secrets",
      }
    }

    // Delete platform with Prisma
    await database.platform.delete({
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
    console.error("Platform deletion error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List platforms with optional filtering and pagination
 */
export async function listPlatforms(
  page = 1,
  limit = 10,
  includeSystem = true
): Promise<{
  success: boolean
  platforms?: PlatformSimpleRo[]
  total?: number
  error?: string
}> {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    const skip = (page - 1) * limit

    // Build filters based on whether to include system platforms
    const where: Prisma.PlatformWhereInput = {}

    if (!includeSystem && session?.user?.id) {
      where.userId = session.user.id
    }

    const [platforms, total] = await Promise.all([
      database.platform.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          name: "asc",
        },
      }),
      database.platform.count({ where }),
    ])

    return {
      success: true,
      platforms: platforms.map((platform) =>
        PlatformEntity.getSimpleRo(platform)
      ),
      total,
    }
  } catch (error) {
    console.error("List platforms error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
