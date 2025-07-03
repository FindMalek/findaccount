import { encryptedDataDtoSchema } from "@/schemas/encryption/encryption"
import { tagDtoSchema, tagSimpleRoSchema } from "@/schemas/utils/tag"
import { AccountStatus } from "@prisma/client"
import { z } from "zod"

import { credentialMetadataDtoSchema } from "./credential-metadata"

export const accountStatusSchema = z.enum([
  AccountStatus.ACTIVE,
  AccountStatus.SUSPENDED,
  AccountStatus.DELETED,
])
export const accountStatusEnum = accountStatusSchema.enum
export const LIST_ACCOUNT_STATUSES = Object.values(accountStatusEnum)
export type AccountStatusInfer = z.infer<typeof accountStatusSchema>

export const credentialDtoSchema = z.object({
  identifier: z.string().min(1, "Username/identifier is required"),
  passwordEncryption: encryptedDataDtoSchema,

  status: z.nativeEnum(AccountStatus),
  description: z.string().optional(),

  tags: z.array(tagDtoSchema),
  metadata: z.array(credentialMetadataDtoSchema),

  platformId: z.string().min(1, "Platform is required"),
  containerId: z.string().optional(),
})

export type CredentialDto = z.infer<typeof credentialDtoSchema>

export const credentialSimpleRoSchema = z.object({
  id: z.string(),

  identifier: z.string(),
  description: z.string().nullable(),
  status: z.nativeEnum(AccountStatus),

  lastViewed: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),

  platformId: z.string(),
  userId: z.string(),
  containerId: z.string().nullable(),
  passwordEncryptionId: z.string(),
})

export type CredentialSimpleRo = z.infer<typeof credentialSimpleRoSchema>

export const credentialIncludeRoSchema = credentialSimpleRoSchema.extend({
  tags: z.array(tagSimpleRoSchema),
})

export type CredentialIncludeRo = z.infer<typeof credentialIncludeRoSchema>

export const getCredentialByIdDtoSchema = z.object({
  id: z.string().min(1, "Credential ID is required"),
})

export type GetCredentialByIdDto = z.infer<typeof getCredentialByIdDtoSchema>

export const updateCredentialDtoSchema = credentialDtoSchema.partial().extend({
  id: z.string().min(1, "Credential ID is required"),
})

export type UpdateCredentialDto = z.infer<typeof updateCredentialDtoSchema>

export const deleteCredentialDtoSchema = z.object({
  id: z.string().min(1, "Credential ID is required"),
})

export type DeleteCredentialDto = z.infer<typeof deleteCredentialDtoSchema>

// Form-specific schema for credential editing (excluding encryption details)
export const credentialFormDtoSchema = z.object({
  identifier: z.string().min(1, "Username/identifier is required"),
  description: z.string().optional(),
  status: z.nativeEnum(AccountStatus),
  platformId: z.string().min(1, "Platform is required"),
  containerId: z.string().optional(),
  // Security settings (metadata)
  passwordProtection: z.boolean(),
  twoFactorAuth: z.boolean(),
  accessLogging: z.boolean(),
})

export type CredentialFormDto = z.infer<typeof credentialFormDtoSchema>
