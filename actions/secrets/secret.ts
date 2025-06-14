"use server"

import { SecretEntity } from "@/entities/secrets/secret"
import { ContainerEntity } from "@/entities/utils/container"
import { database } from "@/prisma/client"
import {
  DeleteSecretDto,
  deleteSecretDtoSchema,
  GetSecretByIdDto,
  getSecretByIdDtoSchema,
  SecretDto,
  secretDtoSchema,
  SecretSimpleRo,
  UpdateSecretDto,
  updateSecretDtoSchema,
} from "@/schemas/secrets/secret"
import { type SecretMetadataDto } from "@/schemas/secrets/secret-metadata"
import { EntityTypeEnum } from "@/schemas/utils"
import { Prisma } from "@prisma/client"
import { z } from "zod"

import { verifySession } from "@/lib/auth/verify"

import { createEncryptedData } from "../encryption"
import { containerSupportsEnvOperations } from "../utils/container"

/**
 * Get secret by ID (Simple RO)
 */
export async function getSimpleSecretById(id: string): Promise<{
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
      include: {
        valueEncryption: true,
      },
    })

    if (!secret) {
      return {
        success: false,
        error: "Secret not found",
      }
    }

    // TODO: Update the 'lastViewed' field

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
    console.error("Get simple secret error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Get secret by ID (Full RO with relations)
 */
export async function getSecretById(data: GetSecretByIdDto): Promise<{
  success: boolean
  secret?: SecretSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const validatedData = getSecretByIdDtoSchema.parse(data)

    // TODO: Add the full RO with relations
    const result = await getSimpleSecretById(validatedData.id)

    // Update last viewed timestamp if secret was found
    if (result.success && result.secret) {
      await database.secret.update({
        where: { id: validatedData.id },
        data: { lastViewed: new Date() },
      })
    }

    return result
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
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
 * Create a new secret
 */
export async function createSecret(data: SecretDto): Promise<{
  success: boolean
  secret?: SecretSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    console.log("Starting secret creation with data:", { 
      name: data.name,
      containerId: data.containerId,
      hasValueEncryption: !!data.valueEncryption,
      metadataCount: data.metadata?.length
    })
    
    const session = await verifySession()
    console.log("Session verified for user:", session.user.id)
    
    let validatedData: SecretDto
    try {
      validatedData = secretDtoSchema.parse(data)
      console.log("Data validated successfully")
    } catch (validationError) {
      console.error("Validation error:", validationError)
      if (validationError instanceof z.ZodError) {
        return {
          success: false,
          error: "Validation failed",
          issues: validationError.issues,
        }
      }
      throw validationError
    }

    // Validate container type if containerId is provided
    if (validatedData.containerId) {
      console.log("Checking container:", validatedData.containerId)
      const container = await database.container.findFirst({
        where: {
          id: validatedData.containerId,
          userId: session.user.id,
        },
      })

      if (!container) {
        console.log("Container not found")
        return {
          success: false,
          error: "Container not found",
        }
      }

      console.log("Container found:", {
        id: container.id,
        type: container.type,
        name: container.name
      })

      const isValid = ContainerEntity.validateEntityForContainer(
        container.type,
        EntityTypeEnum.SECRET
      )
      console.log("Container validation result:", isValid)

      if (!isValid) {
        console.log("Container type validation failed")
        return {
          success: false,
          error: `Cannot add secrets to ${container.type.toLowerCase().replace("_", " ")} container`,
        }
      }
    } else {
      console.log("No container ID provided")
      return {
        success: false,
        error: "Container ID is required",
      }
    }

    // Create encrypted data for secret value
    console.log("Creating encrypted data")
    let valueEncryptionResult
    try {
      valueEncryptionResult = await createEncryptedData({
        encryptedValue: validatedData.valueEncryption.encryptedValue,
        encryptionKey: validatedData.valueEncryption.encryptionKey,
        iv: validatedData.valueEncryption.iv,
      })

      if (!valueEncryptionResult.success || !valueEncryptionResult.encryptedData) {
        console.log("Encryption failed:", valueEncryptionResult)
        return {
          success: false,
          error: "Failed to encrypt secret value",
        }
      }

      console.log("Encryption successful")
    } catch (encryptionError) {
      console.error("Encryption error:", encryptionError)
      return {
        success: false,
        error: "Failed to encrypt secret value",
      }
    }

    console.log("Creating secret in database")
    try {
      const secret = await database.secret.create({
        data: {
          name: validatedData.name,
          valueEncryptionId: valueEncryptionResult.encryptedData.id,
          userId: session.user.id,
          containerId: validatedData.containerId,
          note: validatedData.note,
        },
        include: {
          valueEncryption: true,
        },
      })

      console.log("Secret created successfully")
      return {
        success: true,
        secret: SecretEntity.getSimpleRo(secret),
      }
    } catch (dbError) {
      console.error("Database error:", dbError)
      return {
        success: false,
        error: "Failed to create secret in database",
      }
    }
  } catch (error) {
    console.error("Secret creation error details:", error)
    
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    if (error instanceof z.ZodError) {
      console.log("Validation error:", error.issues)
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
 * Update a secret
 */
export async function updateSecret(data: UpdateSecretDto): Promise<{
  success: boolean
  secret?: SecretSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = updateSecretDtoSchema.parse(data)
    const { id, ...updateData } = validatedData

    // Use getSimpleSecretById to check if secret exists and belongs to user
    const existingSecretResult = await getSimpleSecretById(id)
    if (!existingSecretResult.success) {
      return existingSecretResult
    }

    // Validate using our DTO schema (partial)
    const partialSecretSchema = secretDtoSchema.partial()
    const validatedUpdateData = partialSecretSchema.parse(updateData)

    const updatePayload: Record<string, unknown> = {}

    // Handle value encryption update if provided
    if (validatedUpdateData.valueEncryption) {
      const valueEncryptionResult = await createEncryptedData({
        encryptedValue: validatedUpdateData.valueEncryption.encryptedValue,
        encryptionKey: validatedUpdateData.valueEncryption.encryptionKey,
        iv: validatedUpdateData.valueEncryption.iv,
      })

      if (
        !valueEncryptionResult.success ||
        !valueEncryptionResult.encryptedData
      ) {
        return {
          success: false,
          error: "Failed to encrypt secret value",
        }
      }

      updatePayload.valueEncryptionId = valueEncryptionResult.encryptedData.id
    }

    // Validate container if being updated
    if (validatedUpdateData.containerId) {
      const container = await database.container.findFirst({
        where: {
          id: validatedUpdateData.containerId,
          userId: session.user.id,
        },
      })

      if (!container) {
        return {
          success: false,
          error: "Container not found",
        }
      }

      if (
        !ContainerEntity.validateEntityForContainer(
          container.type,
          EntityTypeEnum.SECRET
        )
      ) {
        return {
          success: false,
          error: `Cannot add secrets to ${container.type.toLowerCase().replace("_", " ")} container`,
        }
      }
    }

    // Add other fields
    Object.assign(updatePayload, {
      name: validatedUpdateData.name,
      note: validatedUpdateData.note,
      containerId: validatedUpdateData.containerId,
      updatedAt: new Date(),
    })

    const updatedSecret = await database.secret.update({
      where: { id },
      data: updatePayload,
      include: {
        valueEncryption: true,
      },
    })

    return {
      success: true,
      secret: SecretEntity.getSimpleRo(updatedSecret),
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
export async function deleteSecret(data: DeleteSecretDto): Promise<{
  success: boolean
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    const session = await verifySession()
    const validatedData = deleteSecretDtoSchema.parse(data)

    // Use getSimpleSecretById to check if secret exists and belongs to user
    const existingSecretResult = await getSimpleSecretById(validatedData.id)
    if (!existingSecretResult.success) {
      return {
        success: false,
        error: existingSecretResult.error,
      }
    }

    await database.secret.delete({
      where: { id: validatedData.id },
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
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
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
 * List secrets with pagination
 */
export async function listSecrets(
  page = 1,
  limit = 10,
  containerId?: string
): Promise<{
  success: boolean
  secrets?: SecretSimpleRo[]
  total?: number
  error?: string
}> {
  try {
    const session = await verifySession()
    const skip = (page - 1) * limit

    const whereClause: Prisma.SecretWhereInput = {
      userId: session.user.id,
      ...(containerId && { containerId }),
    }

    const [secrets, total] = await Promise.all([
      database.secret.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          valueEncryption: true,
        },
      }),
      database.secret.count({ where: whereClause }),
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

/**
 * Create a secret with metadata
 */
export async function createSecretWithMetadata(
  secretData: SecretDto,
  metadataData?: Omit<SecretMetadataDto, "secretId">
): Promise<{
  success: boolean
  secret?: SecretSimpleRo
  error?: string
  issues?: z.ZodIssue[]
}> {
  try {
    // First create the secret
    const secretResult = await createSecret(secretData)

    if (!secretResult.success || !secretResult.secret) {
      return secretResult
    }

    // If metadata is provided, create it
    if (metadataData) {
      const { createSecretMetadata } = await import("./secret-metadata")

      const metadataResult = await createSecretMetadata()

      if (!metadataResult.success) {
        // If metadata creation fails, we should probably delete the secret
        // But for now, we'll just return the secret without metadata
        console.warn(
          "Secret created but metadata creation failed:",
          metadataResult.error
        )
      }
    }

    return secretResult
  } catch (error) {
    console.error("Create secret with metadata error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Generate .env file content from container secrets
 */
export async function generateEnvFile(containerId: string): Promise<{
  success: boolean
  envContent?: string
  error?: string
}> {
  try {
    const session = await verifySession()

    // Check if container supports environment operations
    const supportsEnv = await containerSupportsEnvOperations(containerId)
    if (!supportsEnv.success || !supportsEnv.supports) {
      return {
        success: false,
        error:
          supportsEnv.error ||
          "Container does not support environment operations",
      }
    }

    // Get all secrets in the container
    const secrets = await database.secret.findMany({
      where: {
        containerId,
        userId: session.user.id,
      },
      include: {
        valueEncryption: true,
      },
      orderBy: { name: "asc" },
    })

    if (secrets.length === 0) {
      return {
        success: true,
        envContent: "# No secrets found in this container\n",
      }
    }

    // Generate .env content
    let envContent = `# Generated .env file from container\n# Generated on: ${new Date().toISOString()}\n\n`

    for (const secret of secrets) {
      // Note: In a real implementation, you would decrypt the value here
      // For now, we'll use a placeholder
      envContent += `${secret.name.toUpperCase()}="[ENCRYPTED_VALUE]"\n`
    }

    return {
      success: true,
      envContent,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Generate env file error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Generate .env.example file content from container secrets
 */
export async function generateEnvExampleFile(containerId: string): Promise<{
  success: boolean
  envContent?: string
  error?: string
}> {
  try {
    const session = await verifySession()

    // Check if container supports environment operations
    const supportsEnv = await containerSupportsEnvOperations(containerId)
    if (!supportsEnv.success || !supportsEnv.supports) {
      return {
        success: false,
        error:
          supportsEnv.error ||
          "Container does not support environment operations",
      }
    }

    // Get all secrets in the container
    const secrets = await database.secret.findMany({
      where: {
        containerId,
        userId: session.user.id,
      },
      orderBy: { name: "asc" },
    })

    if (secrets.length === 0) {
      return {
        success: true,
        envContent: "# No secrets found in this container\n",
      }
    }

    // Generate .env.example content
    let envContent = `# Example environment file\n# Copy this file to .env and fill in your values\n# Generated on: ${new Date().toISOString()}\n\n`

    for (const secret of secrets) {
      const note = secret.note ? ` # ${secret.note}` : ""
      envContent += `${secret.name.toUpperCase()}=""${note}\n`
    }

    return {
      success: true,
      envContent,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Generate env example file error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}

/**
 * Generate T3 env.mjs file content from container secrets
 */
export async function generateT3EnvFile(containerId: string): Promise<{
  success: boolean
  envContent?: string
  error?: string
}> {
  try {
    const session = await verifySession()

    // Check if container supports environment operations
    const supportsEnv = await containerSupportsEnvOperations(containerId)
    if (!supportsEnv.success || !supportsEnv.supports) {
      return {
        success: false,
        error:
          supportsEnv.error ||
          "Container does not support environment operations",
      }
    }

    // Get all secrets in the container
    const secrets = await database.secret.findMany({
      where: {
        containerId,
        userId: session.user.id,
      },
      orderBy: { name: "asc" },
    })

    if (secrets.length === 0) {
      return {
        success: true,
        envContent: "// No secrets found in this container\n",
      }
    }

    // Generate T3 env.mjs content
    let envContent = `// T3 Environment Configuration
// Generated on: ${new Date().toISOString()}

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
`

    for (const secret of secrets) {
      const note = secret.note ? ` // ${secret.note}` : ""
      envContent += `    ${secret.name.toUpperCase()}: z.string(),${note}\n`
    }

    envContent += `  },
  client: {
    // Add client-side environment variables here
  },
  runtimeEnv: {
`

    for (const secret of secrets) {
      envContent += `    ${secret.name.toUpperCase()}: process.env.${secret.name.toUpperCase()},\n`
    }

    envContent += `  },
});
`

    return {
      success: true,
      envContent,
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Not authenticated") {
      return {
        success: false,
        error: "Not authenticated",
      }
    }
    console.error("Generate T3 env file error:", error)
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    }
  }
}
