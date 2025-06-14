import { encryptedDataDtoSchema } from "@/schemas/encryption/encryption"
import { z } from "zod"

import { secretMetadataDtoSchema } from "./secret-metadata"

export const secretDtoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  note: z.string().optional(),

  valueEncryption: encryptedDataDtoSchema,
  metadata: z.array(secretMetadataDtoSchema),

  containerId: z.string(),
})

export type SecretDto = z.infer<typeof secretDtoSchema>

export const secretSimpleRoSchema = z.object({
  id: z.string(),

  name: z.string(),
  note: z.string().nullable(),

  lastViewed: z.date().nullable(),
  updatedAt: z.date(),
  createdAt: z.date(),

  userId: z.string(),
  containerId: z.string(),
  valueEncryptionId: z.string(),
})

export type SecretSimpleRo = z.infer<typeof secretSimpleRoSchema>

export const getSecretByIdDtoSchema = z.object({
  id: z.string().min(1, "Secret ID is required"),
})

export type GetSecretByIdDto = z.infer<typeof getSecretByIdDtoSchema>

export const updateSecretDtoSchema = secretDtoSchema.partial().extend({
  id: z.string().min(1, "Secret ID is required"),
})

export type UpdateSecretDto = z.infer<typeof updateSecretDtoSchema>

export const deleteSecretDtoSchema = z.object({
  id: z.string().min(1, "Secret ID is required"),
})

export type DeleteSecretDto = z.infer<typeof deleteSecretDtoSchema>
