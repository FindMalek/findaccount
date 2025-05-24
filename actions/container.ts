"use server"

import { ContainerEntity } from "@/entities/container"
import { database } from "@/prisma/client"
import {
  ContainerDto,
  ContainerSimpleRo,
  type ContainerDto as ContainerDtoType,
} from "@/schemas/container"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"

/**
 * Create a new container
 */
export async function createContainer(data: ContainerDtoType): Promise<{
  success: boolean
  container?: ContainerSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Validate using our DTO schema
    const validatedData = ContainerDto.parse(data)

    try {
      // Create container with Prisma
      const container = await database.container.create({
        data: {
          ...validatedData,
          userId: session.user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        container: ContainerEntity.getSimpleRo(container),
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

    console.error("Container creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get container by ID
 */
export async function getContainerById(id: string): Promise<{
  success: boolean
  container?: ContainerSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    const container = await database.container.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!container) {
      return {
        success: false,
        error: "Container not found",
      }
    }

    return {
      success: true,
      container: ContainerEntity.getSimpleRo(container),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get container error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update a container
 */
export async function updateContainer(
  id: string,
  data: Partial<ContainerDtoType>
): Promise<{
  success: boolean
  container?: ContainerSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Make sure container exists and belongs to user
    const existingContainer = await database.container.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingContainer) {
      return {
        success: false,
        error: "Container not found",
      }
    }

    // Validate using our DTO schema (partial)
    const partialContainerSchema = ContainerDto.partial()
    const validatedData = partialContainerSchema.parse(data)

    try {
      // Update container with Prisma
      const updatedContainer = await database.container.update({
        where: { id },
        data: {
          ...validatedData,
          updatedAt: new Date(),
        },
      })

      return {
        success: true,
        container: ContainerEntity.getSimpleRo(updatedContainer),
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

    console.error("Container update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete a container
 */
export async function deleteContainer(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Make sure container exists and belongs to user
    const existingContainer = await database.container.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingContainer) {
      return {
        success: false,
        error: "Container not found",
      }
    }

    // Check if container has any items
    const [credentialCount, secretCount, cardCount] = await Promise.all([
      database.credential.count({ where: { containerId: id } }),
      database.secret.count({ where: { containerId: id } }),
      database.card.count({ where: { containerId: id } }),
    ])

    if (credentialCount > 0 || secretCount > 0 || cardCount > 0) {
      return {
        success: false,
        error: "Cannot delete container that contains items",
      }
    }

    // Delete container with Prisma
    await database.container.delete({
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
    console.error("Container deletion error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List containers with pagination
 */
export async function listContainers(
  page = 1,
  limit = 10
): Promise<{
  success: boolean
  containers?: ContainerSimpleRo[]
  total?: number
  error?: string
}> {
  try {
    const session = await verifySession()

    const skip = (page - 1) * limit

    const [containers, total] = await Promise.all([
      database.container.findMany({
        where: { userId: session.user.id },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      database.container.count({ where: { userId: session.user.id } }),
    ])

    return {
      success: true,
      containers: containers.map((container) =>
        ContainerEntity.getSimpleRo(container)
      ),
      total,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("List containers error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get container statistics
 */
export async function getContainerStats(id: string): Promise<{
  success: boolean
  stats?: {
    credentialCount: number
    secretCount: number
    cardCount: number
    tagCount: number
  }
  error?: string
}> {
  try {
    const session = await verifySession()

    // Make sure container exists and belongs to user
    const existingContainer = await database.container.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingContainer) {
      return {
        success: false,
        error: "Container not found",
      }
    }

    // Get statistics
    const [credentialCount, secretCount, cardCount, tagCount] =
      await Promise.all([
        database.credential.count({ where: { containerId: id } }),
        database.secret.count({ where: { containerId: id } }),
        database.card.count({ where: { containerId: id } }),
        database.tag.count({ where: { containerId: id } }),
      ])

    return {
      success: true,
      stats: {
        credentialCount,
        secretCount,
        cardCount,
        tagCount,
      },
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get container stats error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
