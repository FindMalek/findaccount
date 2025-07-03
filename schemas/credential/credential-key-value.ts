import {
  encryptedDataDtoSchema,
  genericEncryptedKeyValuePairDtoSchema,
} from "@/schemas/encryption/encryption"
import { z } from "zod"

export const credentialKeyValuePairDtoSchema =
  genericEncryptedKeyValuePairDtoSchema.extend({
    credentialMetadataId: z.string().optional(),
  })

export type CredentialKeyValuePairDto = z.infer<
  typeof credentialKeyValuePairDtoSchema
>

export const credentialKeyValuePairSimpleRoSchema = z.object({
  id: z.string(),

  key: z.string(),
  valueEncryptionId: z.string(),
  credentialMetadataId: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CredentialKeyValuePairSimpleRo = z.infer<
  typeof credentialKeyValuePairSimpleRoSchema
>

export const credentialKeyValuePairWithEncryptionRoSchema = z.object({
  id: z.string(),
  key: z.string(),

  valueEncryption: encryptedDataDtoSchema,
  credentialMetadataId: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CredentialKeyValuePairWithEncryptionRo = z.infer<
  typeof credentialKeyValuePairWithEncryptionRoSchema
>
