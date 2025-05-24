import { PlatformStatus } from "@prisma/client"
import { z } from "zod"

export const PlatformDto = z.object({
  name: z.string().min(1, "Name is required"),
  logo: z.string().optional(),
  loginUrl: z.string().optional(),
  status: z
    .nativeEnum(PlatformStatus)
    .optional()
    .default(PlatformStatus.PENDING),
  userId: z.string().optional(), // Assuming userId can be set during creation or nullable
})

export const PlatformSimpleRoSchema = z.object({
  id: z.string(),

  name: z.string(),

  status: z.nativeEnum(PlatformStatus),

  logo: z.string().nullable(),
  loginUrl: z.string().nullable(),

  updatedAt: z.date(),
  createdAt: z.date(),

  userId: z.string().nullable(),
})

export type PlatformDto = z.infer<typeof PlatformDto>
export type PlatformSimpleRo = z.infer<typeof PlatformSimpleRoSchema>
