"use server"

import { TagEntity } from "@/entities/tag"
import { database } from "@/prisma/client"
import { TagDto, TagSimpleRo, type TagDto as TagDtoType } from "@/schemas/tag"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"
import { getOrReturnEmptyObject } from "@/lib/utils"

/**
 * Utility function to create tags and return connection objects
 */
export async function createTagsAndGetConnections(
  tags: Array<{ name: string; color?: string }>,
  userId: string,
  containerId?: string
): Promise<{ connect: Array<{ id: string }> }> {
  const tagPromises = tags.map(async (tag) => {
    const result = await createTag({
      name: tag.name,
      color: tag.color,
      userId,
      ...getOrReturnEmptyObject(containerId, "containerId"),
    })
    return result.success ? result.tag : null
  })

  const createdTags = (await Promise.all(tagPromises)).filter(
    (tag): tag is NonNullable<typeof tag> => tag !== null
  )

  return {
    connect: createdTags.map((tag) => ({ id: tag.id })),
  }
}

/**
 * Create a new tag
 */
export async function createTag(data: TagDtoType): Promise<{
  success: boolean
  tag?: TagSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Validate using our DTO schema
    const validatedData = TagDto.parse(data)

    try {
      // Check if tag with same name already exists for this user
      const existingTag = await database.tag.findFirst({
        where: {
          name: validatedData.name,
          userId: session.user.id,
        },
      })

      if (existingTag) {
        return {
          success: true,
          tag: TagEntity.getSimpleRo(existingTag),
        }
      }

      // Create tag with Prisma
      const tag = await database.tag.create({
        data: {
          ...validatedData,
          userId: session.user.id,
        },
      })

      return {
        success: true,
        tag: TagEntity.getSimpleRo(tag),
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

    console.error("Tag creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get tag by ID
 */
export async function getTagById(id: string): Promise<{
  success: boolean
  tag?: TagSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    const tag = await database.tag.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!tag) {
      return {
        success: false,
        error: "Tag not found",
      }
    }

    return {
      success: true,
      tag: TagEntity.getSimpleRo(tag),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get tag error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update a tag
 */
export async function updateTag(
  id: string,
  data: Partial<TagDtoType>
): Promise<{
  success: boolean
  tag?: TagSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Make sure tag exists and belongs to user
    const existingTag = await database.tag.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingTag) {
      return {
        success: false,
        error: "Tag not found",
      }
    }

    // Validate using our DTO schema (partial)
    const partialTagSchema = TagDto.partial()
    const validatedData = partialTagSchema.parse(data)

    try {
      // Update tag with Prisma
      const updatedTag = await database.tag.update({
        where: { id },
        data: validatedData,
      })

      return {
        success: true,
        tag: TagEntity.getSimpleRo(updatedTag),
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

    console.error("Tag update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete a tag
 */
export async function deleteTag(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Make sure tag exists and belongs to user
    const existingTag = await database.tag.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingTag) {
      return {
        success: false,
        error: "Tag not found",
      }
    }

    // Check if tag is in use by credentials
    const credentialCount = await database.credential.count({
      where: {
        tags: {
          some: {
            id,
          },
        },
      },
    })

    if (credentialCount > 0) {
      return {
        success: false,
        error: "Cannot delete tag that is in use by credentials",
      }
    }

    // Delete tag with Prisma
    await database.tag.delete({
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
    console.error("Tag deletion error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List tags with optional filtering
 */
export async function listTags(containerId?: string): Promise<{
  success: boolean
  tags?: TagSimpleRo[]
  error?: string
}> {
  try {
    const session = await verifySession()

    // Build filters
    const where: Prisma.TagWhereInput = {
      userId: session.user.id,
    }

    if (containerId) {
      where.containerId = containerId
    }

    const tags = await database.tag.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    })

    return {
      success: true,
      tags: tags.map((tag) => TagEntity.getSimpleRo(tag)),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("List tags error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Add tag to credential
 */
export async function addTagToCredential(
  tagId: string,
  credentialId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Make sure tag exists and belongs to user
    const tag = await database.tag.findFirst({
      where: {
        id: tagId,
        userId: session.user.id,
      },
    })

    if (!tag) {
      return {
        success: false,
        error: "Tag not found",
      }
    }

    // Make sure credential exists and belongs to user
    const credential = await database.credential.findFirst({
      where: {
        id: credentialId,
        userId: session.user.id,
      },
    })

    if (!credential) {
      return {
        success: false,
        error: "Credential not found",
      }
    }

    // Add tag to credential
    await database.credential.update({
      where: { id: credentialId },
      data: {
        tags: {
          connect: {
            id: tagId,
          },
        },
      },
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
    console.error("Add tag to credential error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Remove tag from credential
 */
export async function removeTagFromCredential(
  tagId: string,
  credentialId: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Make sure tag exists and belongs to user
    const tag = await database.tag.findFirst({
      where: {
        id: tagId,
        userId: session.user.id,
      },
    })

    if (!tag) {
      return {
        success: false,
        error: "Tag not found",
      }
    }

    // Make sure credential exists and belongs to user
    const credential = await database.credential.findFirst({
      where: {
        id: credentialId,
        userId: session.user.id,
      },
    })

    if (!credential) {
      return {
        success: false,
        error: "Credential not found",
      }
    }

    // Remove tag from credential
    await database.credential.update({
      where: { id: credentialId },
      data: {
        tags: {
          disconnect: {
            id: tagId,
          },
        },
      },
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
    console.error("Remove tag from credential error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
