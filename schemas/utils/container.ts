import { ContainerType } from "@prisma/client"
import { z } from "zod"

import { tagDtoSchema } from "./tag"

export const containerDtoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),

  description: z.string().optional(),

  type: z.nativeEnum(ContainerType),
  tags: z.array(tagDtoSchema),
})

export type ContainerDto = z.infer<typeof containerDtoSchema>

export const containerSimpleRoSchema = z.object({
  id: z.string(),

  name: z.string(),
  icon: z.string(),

  description: z.string().nullable(),
  type: z.nativeEnum(ContainerType),

  updatedAt: z.date(),
  createdAt: z.date(),

  userId: z.string(),
})

export type ContainerSimpleRo = z.infer<typeof containerSimpleRoSchema>

export const getContainerByIdDtoSchema = z.object({
  id: z.string().min(1, "Container ID is required"),
})

export type GetContainerByIdDto = z.infer<typeof getContainerByIdDtoSchema>

export const updateContainerDtoSchema = containerDtoSchema.partial().extend({
  id: z.string().min(1, "Container ID is required"),
})

export type UpdateContainerDto = z.infer<typeof updateContainerDtoSchema>

export const deleteContainerDtoSchema = z.object({
  id: z.string().min(1, "Container ID is required"),
})

export type DeleteContainerDto = z.infer<typeof deleteContainerDtoSchema>

export const containerTypeSchema = z.nativeEnum(ContainerType)
export const containerTypeEnum = containerTypeSchema.enum
export type ContainerTypeInfer = z.infer<typeof containerTypeSchema>
export const LIST_CONTAINER_TYPES = Object.values(containerTypeEnum)
