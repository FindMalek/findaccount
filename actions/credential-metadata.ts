"use server"

import { CredentialMetadataEntity } from "@/entities/credential"
import { database } from "@/prisma/client"
import {
  CredentialMetadataSchemaDto,
  CredentialMetadataSimpleRo,
  type CredentialMetadataDto as CredentialMetadataDtoType,
} from "@/schemas/credential"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"

/**
 * Create credential metadata
 */
export async function createCredentialMetadata(
  data: CredentialMetadataDtoType
): Promise<{
  success: boolean
  metadata?: CredentialMetadataSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Validate using our DTO schema
    const validatedData = CredentialMetadataSchemaDto.parse(data)

    try {
      // Check if credential exists and belongs to the user
      const credential = await database.credential.findFirst({
        where: {
          id: validatedData.credentialId,
          userId: session.user.id,
        },
      })

      if (!credential) {
        return {
          success: false,
          error: "Credential not found",
        }
      }

      // Check if metadata already exists for this credential
      const existingMetadata = await database.credentialMetadata.findFirst({
        where: { credentialId: validatedData.credentialId },
      })

      if (existingMetadata) {
        return {
          success: false,
          error: "Metadata already exists for this credential",
        }
      }

      // Create metadata with Prisma
      const metadata = await database.credentialMetadata.create({
        data: {
          ...validatedData,
        },
      })

      return {
        success: true,
        metadata: CredentialMetadataEntity.getSimpleRo(metadata),
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

    console.error("Credential metadata creation error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get credential metadata
 */
export async function getCredentialMetadata(credentialId: string): Promise<{
  success: boolean
  metadata?: CredentialMetadataSimpleRo
  error?: string
}> {
  try {
    const session = await verifySession()

    // Check if credential exists and belongs to the user
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

    // Get metadata
    const metadata = await database.credentialMetadata.findFirst({
      where: { credentialId },
    })

    if (!metadata) {
      return {
        success: false,
        error: "Metadata not found for this credential",
      }
    }

    return {
      success: true,
      metadata: CredentialMetadataEntity.getSimpleRo(metadata),
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Get credential metadata error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Update credential metadata
 */
export async function updateCredentialMetadata(
  id: string,
  data: Partial<CredentialMetadataDtoType>
): Promise<{
  success: boolean
  metadata?: CredentialMetadataSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()

    // Get metadata
    const existingMetadata = await database.credentialMetadata.findUnique({
      where: { id },
      include: { credential: true },
    })

    if (!existingMetadata) {
      return {
        success: false,
        error: "Metadata not found",
      }
    }

    // Check if credential belongs to the user
    if (existingMetadata.credential.userId !== session.user.id) {
      return {
        success: false,
        error: "Not authorized",
      }
    }

    // Validate using our DTO schema (partial)
    const partialMetadataSchema = CredentialMetadataSchemaDto.partial()
    const validatedData = partialMetadataSchema.parse(data)

    try {
      // Update metadata with Prisma
      const updatedMetadata = await database.credentialMetadata.update({
        where: { id },
        data: validatedData,
      })

      return {
        success: true,
        metadata: CredentialMetadataEntity.getSimpleRo(updatedMetadata),
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

    console.error("Credential metadata update error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Delete credential metadata
 */
export async function deleteCredentialMetadata(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const session = await verifySession()

    // Get metadata
    const existingMetadata = await database.credentialMetadata.findUnique({
      where: { id },
      include: { credential: true },
    })

    if (!existingMetadata) {
      return {
        success: false,
        error: "Metadata not found",
      }
    }

    // Check if credential belongs to the user
    if (existingMetadata.credential.userId !== session.user.id) {
      return {
        success: false,
        error: "Not authorized",
      }
    }

    // Delete metadata with Prisma
    await database.credentialMetadata.delete({
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
    console.error("Delete credential metadata error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
