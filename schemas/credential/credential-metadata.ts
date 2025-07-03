import { z } from "zod"

import { credentialKeyValuePairDtoSchema } from "./credential-key-value"

export const credentialMetadataDtoSchema = z.object({
  recoveryEmail: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  has2FA: z.boolean(),

  keyValuePairs: z.array(credentialKeyValuePairDtoSchema).optional(),
})

export type CredentialMetadataDto = z.infer<typeof credentialMetadataDtoSchema>

export const credentialMetadataSimpleRoSchema = z.object({
  id: z.string(),

  recoveryEmail: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  has2FA: z.boolean(),

  credentialId: z.string(),
})

export type CredentialMetadataSimpleRo = z.infer<
  typeof credentialMetadataSimpleRoSchema
>
