import { database } from "@/prisma/client"
import type { TagDto } from "@/schemas/utils/tag"
import type { Prisma, Tag } from "@prisma/client"

import { generateTagColor } from "./color-helpers"

export async function createTagsAndGetConnections(
  tags: TagDto[],
  userId: string,
  containerId?: string
): Promise<Prisma.TagCreateNestedManyWithoutContainerInput> {
  if (!tags || tags.length === 0) {
    return { connect: [] }
  }

  const existingTags = await database.tag.findMany({
    where: {
      name: { in: tags.map((tag) => tag.name) },
      userId,
      containerId: containerId || null,
    },
  })

  const existingTagNames = new Set(existingTags.map((tag) => tag.name))
  const tagsToCreate = tags.filter((tag) => !existingTagNames.has(tag.name))

  let newTags: Tag[] = []
  if (tagsToCreate.length > 0) {
    const createData = tagsToCreate.map((tag) => ({
      name: tag.name,
      color: tag.color ?? generateTagColor(tag.name, "pastel"),
      userId,
      containerId: containerId || null,
    }))

    await database.tag.createMany({ data: createData })

    newTags = await database.tag.findMany({
      where: {
        name: { in: tagsToCreate.map((tag) => tag.name) },
        userId,
        containerId: containerId || null,
      },
    })
  }

  const allTags = [...existingTags, ...newTags]
  const tagConnections = allTags.map((tag) => ({ id: tag.id }))

  return { connect: tagConnections }
}
