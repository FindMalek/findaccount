import {
  CredentialEntity,
  CredentialQuery,
} from "@/entities/credential/credential"
import { authMiddleware } from "@/middleware/auth"
import { database } from "@/prisma/client"
import {
  createCredentialWithMetadataInputSchema,
  createCredentialWithMetadataOutputSchema,
  type CreateCredentialWithMetadataInput,
  type CreateCredentialWithMetadataOutput,
} from "@/schemas/credential/credential-with-metadata"
import {
  createCredentialInputSchema,
  credentialOutputSchema,
  deleteCredentialInputSchema,
  getCredentialInputSchema,
  listCredentialsInputSchema,
  listCredentialsOutputSchema,
  updateCredentialInputSchema,
  type CredentialOutput,
  type ListCredentialsOutput,
} from "@/schemas/credential/dto"
import { ORPCError, os } from "@orpc/server"
import type { Prisma } from "@prisma/client"
import { z } from "zod"

import { decryptData } from "@/lib/encryption"
import { getOrReturnEmptyObject } from "@/lib/utils"
import { createEncryptedData } from "@/lib/utils/encryption-helpers"
import { createTagsAndGetConnections } from "@/lib/utils/tag-helpers"

import type { ORPCContext } from "../types"

const baseProcedure = os.$context<ORPCContext>()
const authProcedure = baseProcedure.use(({ context, next }) =>
  authMiddleware({ context, next })
)

// Get credential by ID
export const getCredential = authProcedure
  .input(getCredentialInputSchema)
  .output(credentialOutputSchema)
  .handler(async ({ input, context }): Promise<CredentialOutput> => {
    const credential = await database.credential.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
    })

    if (!credential) {
      throw new ORPCError("NOT_FOUND")
    }

    // Update last viewed timestamp
    await database.credential.update({
      where: { id: input.id },
      data: { lastViewed: new Date() },
    })

    return CredentialEntity.getSimpleRo(credential)
  })

// Get credential password (decrypted on server for security)
export const getCredentialPassword = authProcedure
  .input(getCredentialInputSchema)
  .output(z.object({ password: z.string() }))
  .handler(async ({ input, context }): Promise<{ password: string }> => {
    const credential = await database.credential.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
      include: {
        passwordEncryption: true,
      },
    })

    if (!credential) {
      throw new ORPCError("NOT_FOUND")
    }

    if (!credential.passwordEncryption) {
      throw new ORPCError("NOT_FOUND", {
        message: "Password encryption data not found",
      })
    }

    try {
      // Decrypt password on server for security
      const decryptedPassword = await decryptData(
        credential.passwordEncryption.encryptedValue,
        credential.passwordEncryption.iv,
        credential.passwordEncryption.encryptionKey
      )

      // Update last viewed timestamp
      await database.credential.update({
        where: { id: input.id },
        data: { lastViewed: new Date() },
      })

      return { password: decryptedPassword }
    } catch (error) {
      console.error("Failed to decrypt password:", error)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to decrypt password",
      })
    }
  })

// List credentials with pagination
export const listCredentials = authProcedure
  .input(listCredentialsInputSchema)
  .output(listCredentialsOutputSchema)
  .handler(async ({ input, context }): Promise<ListCredentialsOutput> => {
    const { page, limit, search, containerId, platformId } = input
    const skip = (page - 1) * limit

    const where = {
      userId: context.user.id,
      ...(containerId && { containerId }),
      ...(platformId && { platformId }),
      ...(search && {
        OR: [
          { identifier: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    }

    const [credentials, total] = await Promise.all([
      database.credential.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { ...CredentialQuery.getInclude() },
      }),
      database.credential.count({ where }),
    ])

    return {
      credentials: credentials.map((credential) =>
        CredentialEntity.getRo(credential)
      ),
      total,
      hasMore: skip + credentials.length < total,
      page,
      limit,
    }
  })

// Create credential
export const createCredential = authProcedure
  .input(createCredentialInputSchema)
  .output(credentialOutputSchema)
  .handler(async ({ input, context }): Promise<CredentialOutput> => {
    // Verify platform exists
    const platform = await database.platform.findUnique({
      where: { id: input.platformId },
    })

    if (!platform) {
      throw new ORPCError("NOT_FOUND")
    }

    // Check if credential with same identifier already exists for this platform and user
    const existingCredential = await database.credential.findFirst({
      where: {
        identifier: input.identifier,
        platformId: input.platformId,
        userId: context.user.id,
      },
    })

    if (existingCredential) {
      throw new ORPCError("CONFLICT", {
        message:
          "A credential with this identifier already exists for this platform",
      })
    }

    const tagConnections = await createTagsAndGetConnections(
      input.tags,
      context.user.id,
      input.containerId
    )

    // Create encrypted data for password
    const passwordEncryptionResult = await createEncryptedData({
      encryptedValue: input.passwordEncryption.encryptedValue,
      encryptionKey: input.passwordEncryption.encryptionKey,
      iv: input.passwordEncryption.iv,
    })

    if (
      !passwordEncryptionResult.success ||
      !passwordEncryptionResult.encryptedData
    ) {
      throw new ORPCError("INTERNAL_SERVER_ERROR")
    }

    const credential = await database.credential.create({
      data: {
        identifier: input.identifier,
        passwordEncryptionId: passwordEncryptionResult.encryptedData.id,
        status: input.status,
        platformId: input.platformId,
        description: input.description,
        userId: context.user.id,
        tags: tagConnections,
        ...getOrReturnEmptyObject(input.containerId, "containerId"),
      },
    })

    return CredentialEntity.getSimpleRo(credential)
  })

// Update credential
export const updateCredential = authProcedure
  .input(updateCredentialInputSchema)
  .output(credentialOutputSchema)
  .handler(async ({ input, context }): Promise<CredentialOutput> => {
    const { id, ...updateData } = input

    // Verify credential ownership
    const existingCredential = await database.credential.findFirst({
      where: {
        id,
        userId: context.user.id,
      },
    })

    if (!existingCredential) {
      throw new ORPCError("NOT_FOUND")
    }

    // Check for duplicate identifier if identifier or platformId is being updated
    if (
      updateData.identifier !== undefined ||
      updateData.platformId !== undefined
    ) {
      const newIdentifier =
        updateData.identifier ?? existingCredential.identifier
      const newPlatformId =
        updateData.platformId ?? existingCredential.platformId

      const duplicateCredential = await database.credential.findFirst({
        where: {
          identifier: newIdentifier,
          platformId: newPlatformId,
          userId: context.user.id,
          NOT: { id }, // Exclude current credential
        },
      })

      if (duplicateCredential) {
        throw new ORPCError("CONFLICT", {
          message:
            "A credential with this identifier already exists for this platform",
        })
      }
    }

    // Process the update data
    const updatePayload: Prisma.CredentialUpdateInput = {}

    if (updateData.identifier !== undefined)
      updatePayload.identifier = updateData.identifier
    if (updateData.description !== undefined)
      updatePayload.description = updateData.description
    if (updateData.status !== undefined)
      updatePayload.status = updateData.status
    if (updateData.platformId !== undefined)
      updatePayload.platform = { connect: { id: updateData.platformId } }
    if (updateData.containerId !== undefined) {
      updatePayload.container = updateData.containerId
        ? { connect: { id: updateData.containerId } }
        : { disconnect: true }
    }

    // Handle tags if provided
    if (updateData.tags !== undefined) {
      const tagConnections = await createTagsAndGetConnections(
        updateData.tags,
        context.user.id,
        updateData.containerId || existingCredential.containerId || undefined
      )
      updatePayload.tags = tagConnections
    }

    // Handle password encryption updates if provided
    if (updateData.passwordEncryption) {
      const passwordEncryptionResult = await createEncryptedData({
        encryptedValue: updateData.passwordEncryption.encryptedValue,
        encryptionKey: updateData.passwordEncryption.encryptionKey,
        iv: updateData.passwordEncryption.iv,
      })

      if (
        !passwordEncryptionResult.success ||
        !passwordEncryptionResult.encryptedData
      ) {
        throw new ORPCError("INTERNAL_SERVER_ERROR")
      }

      updatePayload.passwordEncryption = {
        connect: { id: passwordEncryptionResult.encryptedData.id },
      }
    }

    const updatedCredential = await database.credential.update({
      where: { id },
      data: updatePayload,
    })

    return CredentialEntity.getSimpleRo(updatedCredential)
  })

// Delete credential
export const deleteCredential = authProcedure
  .input(deleteCredentialInputSchema)
  .output(credentialOutputSchema)
  .handler(async ({ input, context }): Promise<CredentialOutput> => {
    // Verify credential ownership
    const existingCredential = await database.credential.findFirst({
      where: {
        id: input.id,
        userId: context.user.id,
      },
    })

    if (!existingCredential) {
      throw new ORPCError("NOT_FOUND")
    }

    const deletedCredential = await database.credential.delete({
      where: { id: input.id },
    })

    return CredentialEntity.getSimpleRo(deletedCredential)
  })

// Create credential with metadata
export const createCredentialWithMetadata = authProcedure
  .input(createCredentialWithMetadataInputSchema)
  .output(createCredentialWithMetadataOutputSchema)
  .handler(
    async ({ input, context }): Promise<CreateCredentialWithMetadataOutput> => {
      const { credential: credentialData, metadata } = input

      try {
        // Verify platform exists
        const platform = await database.platform.findUnique({
          where: { id: credentialData.platformId },
        })

        if (!platform) {
          throw new ORPCError("NOT_FOUND")
        }

        // Check if credential with same identifier already exists for this platform and user
        const existingCredential = await database.credential.findFirst({
          where: {
            identifier: credentialData.identifier,
            platformId: credentialData.platformId,
            userId: context.user.id,
          },
        })

        if (existingCredential) {
          throw new ORPCError("CONFLICT", {
            message:
              "A credential with this identifier already exists for this platform",
          })
        }

        const tagConnections = await createTagsAndGetConnections(
          credentialData.tags,
          context.user.id,
          credentialData.containerId
        )

        // Create encrypted data for password
        const passwordEncryptionResult = await createEncryptedData({
          encryptedValue: credentialData.passwordEncryption.encryptedValue,
          encryptionKey: credentialData.passwordEncryption.encryptionKey,
          iv: credentialData.passwordEncryption.iv,
        })

        if (
          !passwordEncryptionResult.success ||
          !passwordEncryptionResult.encryptedData
        ) {
          throw new ORPCError("INTERNAL_SERVER_ERROR")
        }

        // Use transaction for atomicity
        const result = await database.$transaction(async (tx) => {
          const credential = await tx.credential.create({
            data: {
              identifier: credentialData.identifier,
              passwordEncryptionId: passwordEncryptionResult.encryptedData!.id,
              status: credentialData.status,
              platformId: credentialData.platformId,
              description: credentialData.description,
              userId: context.user.id,
              tags: tagConnections,
              ...getOrReturnEmptyObject(
                credentialData.containerId,
                "containerId"
              ),
            },
          })

          // Create metadata if provided
          if (metadata) {
            const credentialMetadata = await tx.credentialMetadata.create({
              data: {
                credentialId: credential.id,
                recoveryEmail: metadata.recoveryEmail,
                phoneNumber: metadata.phoneNumber,
                has2FA: metadata.has2FA || false,
              },
            })

            // Create encrypted key-value pairs if provided
            if (metadata.keyValuePairs && metadata.keyValuePairs.length > 0) {
              for (const kvPair of metadata.keyValuePairs) {
                // Create encrypted data for the value
                const valueEncryptionResult = await createEncryptedData({
                  encryptedValue: kvPair.valueEncryption.encryptedValue,
                  encryptionKey: kvPair.valueEncryption.encryptionKey,
                  iv: kvPair.valueEncryption.iv,
                })

                if (
                  !valueEncryptionResult.success ||
                  !valueEncryptionResult.encryptedData
                ) {
                  throw new ORPCError("INTERNAL_SERVER_ERROR", {
                    message:
                      "Failed to create encrypted data for key-value pair",
                  })
                }

                // Create the key-value pair
                await tx.credentialKeyValuePair.create({
                  data: {
                    key: kvPair.key,
                    valueEncryptionId: valueEncryptionResult.encryptedData.id,
                    credentialMetadataId: credentialMetadata.id,
                  },
                })
              }
            }
          }

          return credential
        })

        return {
          success: true,
          credential: CredentialEntity.getSimpleRo(result),
        }
      } catch (error) {
        console.error("Error creating credential with metadata:", error)

        // If it's an ORPCError, re-throw it to maintain consistent error handling
        if (error instanceof ORPCError) {
          throw error
        }

        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        }
      }
    }
  )

// Export the credential router
export const credentialRouter = {
  get: getCredential,
  getPassword: getCredentialPassword,
  list: listCredentials,
  create: createCredential,
  createWithMetadata: createCredentialWithMetadata,
  update: updateCredential,
  delete: deleteCredential,
}
