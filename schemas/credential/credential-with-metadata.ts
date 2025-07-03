import { z } from "zod"

import { credentialMetadataDtoSchema } from "./credential-metadata"
import { createCredentialInputSchema, credentialOutputSchema } from "./dto"

// Schema for creating a credential with metadata
export const createCredentialWithMetadataInputSchema = z.object({
  credential: createCredentialInputSchema,
  metadata: credentialMetadataDtoSchema.optional(),
})

export const createCredentialWithMetadataOutputSchema = z.object({
  success: z.boolean(),
  credential: credentialOutputSchema.optional(),
  error: z.string().optional(),
  issues: z.array(z.string()).optional(),
})

export type CreateCredentialWithMetadataInput = z.infer<
  typeof createCredentialWithMetadataInputSchema
>
export type CreateCredentialWithMetadataOutput = z.infer<
  typeof createCredentialWithMetadataOutputSchema
>
