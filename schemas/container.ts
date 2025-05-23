import { z } from "zod"

export const ContainerDto = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  description: z.string().optional(),
  userId: z.string(), // Assuming userId is provided during creation
})

export const ContainerSimpleRoSchema = z.object({
  id: z.string(),

  name: z.string(),
  icon: z.string(),

  description: z.string().nullable(),

  updatedAt: z.date(),
  createdAt: z.date(),

  userId: z.string(),
})

export type ContainerDto = z.infer<typeof ContainerDto>
export type ContainerSimpleRo = z.infer<typeof ContainerSimpleRoSchema>
