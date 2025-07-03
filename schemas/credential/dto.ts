import { z } from "zod"

import {
  credentialDtoSchema,
  credentialIncludeRoSchema,
  credentialSimpleRoSchema,
  deleteCredentialDtoSchema,
  getCredentialByIdDtoSchema,
  updateCredentialDtoSchema,
} from "./credential"

// Input DTOs for oRPC procedures
export const createCredentialInputSchema = credentialDtoSchema
export const getCredentialInputSchema = getCredentialByIdDtoSchema
export const updateCredentialInputSchema = updateCredentialDtoSchema
export const deleteCredentialInputSchema = deleteCredentialDtoSchema

// List credentials with pagination
export const listCredentialsInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  containerId: z.string().optional(),
  platformId: z.string().optional(),
})

// Output DTOs for oRPC procedures
export const credentialOutputSchema = credentialSimpleRoSchema
export const credentialIncludeOutputSchema = credentialIncludeRoSchema

export const listCredentialsOutputSchema = z.object({
  credentials: z.array(credentialIncludeOutputSchema),
  total: z.number().int(),
  hasMore: z.boolean(),
  page: z.number().int(),
  limit: z.number().int(),
})

// Export types
export type CreateCredentialInput = z.infer<typeof createCredentialInputSchema>
export type GetCredentialInput = z.infer<typeof getCredentialInputSchema>
export type UpdateCredentialInput = z.infer<typeof updateCredentialInputSchema>
export type DeleteCredentialInput = z.infer<typeof deleteCredentialInputSchema>
export type ListCredentialsInput = z.infer<typeof listCredentialsInputSchema>

export type CredentialOutput = z.infer<typeof credentialOutputSchema>
export type CredentialIncludeOutput = z.infer<
  typeof credentialIncludeOutputSchema
>
export type ListCredentialsOutput = z.infer<typeof listCredentialsOutputSchema>
