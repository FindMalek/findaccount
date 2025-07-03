import { z } from "zod"

export const tagDtoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().optional(),
  containerId: z.string().optional(),
})

export type TagDto = z.infer<typeof tagDtoSchema>

export const tagSimpleRoSchema = z.object({
  id: z.string(),
  name: z.string(),

  color: z.string(),

  userId: z.string().nullable(),
  containerId: z.string().nullable(),
})

export type TagSimpleRo = z.infer<typeof tagSimpleRoSchema>

export const getTagByIdDtoSchema = z.object({
  id: z.string().min(1, "Tag ID is required"),
})

export type GetTagByIdDto = z.infer<typeof getTagByIdDtoSchema>

export const updateTagDtoSchema = tagDtoSchema.partial().extend({
  id: z.string().min(1, "Tag ID is required"),
})

export type UpdateTagDto = z.infer<typeof updateTagDtoSchema>

export const deleteTagDtoSchema = z.object({
  id: z.string().min(1, "Tag ID is required"),
})

export type DeleteTagDto = z.infer<typeof deleteTagDtoSchema>
