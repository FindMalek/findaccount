import { z } from "zod"

export const encryptedDataDtoSchema = z.object({
  iv: z.string().min(1, "IV is required"),
  encryptedValue: z.string().min(1, "Encrypted value is required"),
  encryptionKey: z.string().min(1, "Encryption key is required"),
})

export type EncryptedDataDto = z.infer<typeof encryptedDataDtoSchema>

export const encryptedDataSimpleRoSchema = z.object({
  id: z.string(),

  iv: z.string(),
  encryptionKey: z.string(),
  encryptedValue: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
})

export type EncryptedDataSimpleRo = z.infer<typeof encryptedDataSimpleRoSchema>

// Generic encrypted key-value pair interface for reusable components
export const genericEncryptedKeyValuePairDtoSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(1, "Key is required"),
  valueEncryption: encryptedDataDtoSchema,
})

export type GenericEncryptedKeyValuePairDto = z.infer<
  typeof genericEncryptedKeyValuePairDtoSchema
>
