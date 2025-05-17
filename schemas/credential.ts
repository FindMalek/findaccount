import { AccountStatus } from "@prisma/client"
import { z } from "zod"

export const CredentialSchemaDto = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  status: z.nativeEnum(AccountStatus).optional().default(AccountStatus.ACTIVE),
  description: z.string().optional(),
  loginUrl: z.string().url().optional(),
  platformId: z.string(),
  containerId: z.string().optional(),
})

export const CredentialSimpleRoSchema = z.object({
  id: z.string(),

  username: z.string(),
  password: z.string(),

  status: z.nativeEnum(AccountStatus),

  description: z.string().nullable(),
  loginUrl: z.string().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),

  platformId: z.string(),
  userId: z.string(),
  containerId: z.string().nullable(),
})

export type CredentialDto = z.infer<typeof CredentialSchemaDto>
export type CredentialSimpleRo = z.infer<typeof CredentialSimpleRoSchema>

export const CredentialMetadataDto = z.object({
  recoveryEmail: z.string().email().optional(),
  accountId: z.string().optional(),
  iban: z.string().optional(),
  bankName: z.string().optional(),
  otherInfo: z.string().optional(),
  has2FA: z.boolean().optional().default(false),
  credentialId: z.string(),
})

export const CredentialMetadataSimpleRo = z.object({
  id: z.string(),

  recoveryEmail: z.string().nullable(),

  accountId: z.string().nullable(),
  iban: z.string().nullable(),
  bankName: z.string().nullable(),
  otherInfo: z.string().nullable(),

  has2FA: z.boolean(),

  credentialId: z.string(),
})

export type CredentialMetadataDto = z.infer<typeof CredentialMetadataDto>
export type CredentialMetadataSimpleRo = z.infer<
  typeof CredentialMetadataSimpleRo
>

export const CredentialHistoryDto = z.object({
  oldPassword: z.string(),
  newPassword: z.string(),
  credentialId: z.string(),
})

export const CredentialHistorySimpleRo = z.object({
  id: z.string(),

  oldPassword: z.string(),
  newPassword: z.string(),

  changedAt: z.date(),

  userId: z.string(),
  credentialId: z.string(),
})

export type CredentialHistoryDto = z.infer<typeof CredentialHistoryDto>
export type CredentialHistorySimpleRo = z.infer<
  typeof CredentialHistorySimpleRo
>
