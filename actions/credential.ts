"use server"

import { CredentialEntity } from "@/entities/credential"
import { database } from "@/prisma/client"
import {
  CredentialMetadataSchemaDto,
  CredentialSchemaDto,
  CredentialSimpleRo,
  type CredentialDto as CredentialDtoType,
  type CredentialMetadataDto as CredentialMetadataDtoType,
} from "@/schemas/credential"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"
import { getOrReturnEmptyObject } from "@/lib/utils"

import { createTagsAndGetConnections } from "@/actions/tag"

/**
 * Create a new credential
 */
export async function createCredential(data: CredentialDtoType): Promise<{
  success: boolean
  credential?: CredentialSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = CredentialSchemaDto.parse(data)

    try {
      const platform = await database.platform.findUnique({
        where: { id: validatedData.platformId },
      })

      if (!platform) {
        return {
          success: false,
          error: "Platform not found",
        }
      }

      const tagConnections = await createTagsAndGetConnections(
        validatedData.tags,
        session.user.id,
        validatedData.containerId
      )

      const credential = await database.credential.create({
        data: {
          username: validatedData.username,
          password: validatedData.password,
          encryptionKey: validatedData.encryptionKey,
          iv: validatedData.iv,
          status: validatedData.status,
          platformId: validatedData.platformId,
          description: validatedData.description,
          userId: session.user.id,
          tags: tagConnections,
          ...getOrReturnEmptyObject(validatedData.containerId, "containerId"),
        },
      })

      return {
        success: true,
        credential: CredentialEntity.getSimpleRo(credential),
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

    console.error("Credential creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get credential by ID
 */
export async function getCredentialById(id: string): Promise<{
  success: boolean
  credential?: CredentialSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    const credential = await database.credential.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!credential) {
      return {
        success: false,
        error: "Credential not found",
      }
    }

    // Update last viewed timestamp
    await database.credential.update({
      where: { id },
      data: { lastViewed: new Date() },
    })

    return {
      success: true,
      credential: CredentialEntity.getSimpleRo(credential),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get credential error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update a credential
 */
export async function updateCredential(
  id: string,
  data: Partial<CredentialDtoType>
): Promise<{
  success: boolean
  credential?: CredentialSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Make sure credential exists and belongs to user
    const existingCredential = await database.credential.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingCredential) {
      return {
        success: false,
        error: "Credential not found",
      }
    }

    // Validate using our DTO schema (partial)
    const partialCredentialSchema = CredentialSchemaDto.partial()
    const validatedData = partialCredentialSchema.parse(data)

    try {
      // If password is being updated, create a history entry
      if (validatedData.password) {
        await database.credentialHistory.create({
          data: {
            oldPassword: existingCredential.password,
            newPassword: validatedData.password,
            encryptionKey:
              validatedData.encryptionKey || existingCredential.encryptionKey,
            iv: validatedData.iv || existingCredential.iv,
            credentialId: id,
            userId: session.user.id,
            changedAt: new Date(),
          },
        })
      }

      const tagConnections = await createTagsAndGetConnections(
        validatedData.tags || [],
        session.user.id,
        validatedData.containerId
      )

      // Update credential with Prisma
      const updatedCredential = await database.credential.update({
        where: { id },
        data: {
          ...validatedData,
          tags: tagConnections,
        },
      })

      return {
        success: true,
        credential: CredentialEntity.getSimpleRo(updatedCredential),
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

    console.error("Credential update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete a credential
 */
export async function deleteCredential(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Make sure credential exists and belongs to user
    const existingCredential = await database.credential.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingCredential) {
      return {
        success: false,
        error: "Credential not found",
      }
    }

    // Delete credential with Prisma (will cascade delete history and metadata)
    await database.credential.delete({
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
    console.error("Credential deletion error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * List credentials with optional filtering and pagination
 */
export async function listCredentials(
  page = 1,
  limit = 10,
  containerId?: string,
  platformId?: string
): Promise<{
  success: boolean
  credentials?: CredentialSimpleRo[]
  total?: number
  error?: string
}> {
  try {
    const session = await verifySession()

    const skip = (page - 1) * limit

    // Build filters
    const where: Prisma.CredentialWhereInput = {
      userId: session.user.id,
    }

    if (containerId) {
      where.containerId = containerId
    }

    if (platformId) {
      where.platformId = platformId
    }

    const [credentials, total] = await Promise.all([
      database.credential.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      database.credential.count({ where }),
    ])

    return {
      success: true,
      credentials: credentials.map((credential) =>
        CredentialEntity.getSimpleRo(credential)
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
    console.error("List credentials error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Copy credential password
 */
export async function copyCredentialPassword(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Make sure credential exists and belongs to user
    const existingCredential = await database.credential.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingCredential) {
      return {
        success: false,
        error: "Credential not found",
      }
    }

    // Update last copied timestamp
    await database.credential.update({
      where: { id },
      data: { lastCopied: new Date() },
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
    console.error("Copy credential password error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Create a new credential with optional metadata
 */
export async function createCredentialWithMetadata(
  credentialData: CredentialDtoType,
  metadataData?: Omit<CredentialMetadataDtoType, "credentialId">
): Promise<{
  success: boolean
  credential?: CredentialSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedCredentialData = CredentialSchemaDto.parse(credentialData)

    try {
      const tagConnections = await createTagsAndGetConnections(
        validatedCredentialData.tags,
        session.user.id,
        validatedCredentialData.containerId
      )

      // Use a transaction to create both credential and metadata
      const result = await database.$transaction(async (tx) => {
        const credential = await tx.credential.create({
          data: {
            username: validatedCredentialData.username,
            password: validatedCredentialData.password,
            encryptionKey: validatedCredentialData.encryptionKey,
            iv: validatedCredentialData.iv,
            status: validatedCredentialData.status,
            platformId: validatedCredentialData.platformId,
            description: validatedCredentialData.description,
            userId: session.user.id,
            tags: tagConnections,
            ...getOrReturnEmptyObject(
              validatedCredentialData.containerId,
              "containerId"
            ),
          },
        })

        // Create metadata if provided
        if (metadataData) {
          const validatedMetadataData = CredentialMetadataSchemaDto.parse({
            ...metadataData,
            credentialId: credential.id,
          })

          await tx.credentialMetadata.create({
            data: validatedMetadataData,
          })
        }

        return credential
      })

      return {
        success: true,
        credential: CredentialEntity.getSimpleRo(result),
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

    console.error("Credential creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
