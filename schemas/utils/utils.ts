import { CardSimpleRo, cardSimpleRoSchema } from "@/schemas/card"
import {
  CredentialSimpleRo,
  credentialSimpleRoSchema,
} from "@/schemas/credential"
import { SecretSimpleRo, secretSimpleRoSchema } from "@/schemas/secrets"
import { z } from "zod"

export const ActivityTypeSchema = z.enum(["CREATED", "UPDATED", "COPIED"])
export const ActivityTypeEnum = ActivityTypeSchema.enum
export type ActivityType = z.infer<typeof ActivityTypeSchema>
export const LIST_ACTIVITY_TYPE = Object.values(ActivityTypeEnum)

export const RecentItemTypeSchema = z.enum(["CREDENTIAL", "CARD", "SECRET"])
export const RecentItemTypeEnum = RecentItemTypeSchema.enum
export type RecentItemType = z.infer<typeof RecentItemTypeSchema>
export const LIST_RECENT_ITEM_TYPE = Object.values(RecentItemTypeEnum)

export const RecentItemBaseSchema = z.object({
  id: z.string(),
  name: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),

  lastCopiedAt: z.date().optional(),
  lastActivityAt: z.date(),
  activityType: ActivityTypeSchema,
})

export type RecentItemBase = z.infer<typeof RecentItemBaseSchema>

export const RecentCredentialItemSchema = RecentItemBaseSchema.extend({
  type: z.literal(RecentItemTypeEnum.CREDENTIAL),
  entity: credentialSimpleRoSchema,
})

export type RecentCredentialItem = z.infer<typeof RecentCredentialItemSchema>

export const RecentCardItemSchema = RecentItemBaseSchema.extend({
  type: z.literal(RecentItemTypeEnum.CARD),
  entity: cardSimpleRoSchema,
})

export type RecentCardItem = z.infer<typeof RecentCardItemSchema>

export const RecentSecretItemSchema = RecentItemBaseSchema.extend({
  type: z.literal(RecentItemTypeEnum.SECRET),
  entity: secretSimpleRoSchema,
})

export type RecentSecretItem = z.infer<typeof RecentSecretItemSchema>

export const RecentItemSchema = z.discriminatedUnion("type", [
  RecentCredentialItemSchema,
  RecentCardItemSchema,
  RecentSecretItemSchema,
])

export type RecentItem =
  | RecentCredentialItem
  | RecentCardItem
  | RecentSecretItem

export type RawEntity = CredentialSimpleRo | CardSimpleRo | SecretSimpleRo

export const EntityTypeSchema = z.enum(["CREDENTIAL", "CARD", "SECRET"])
export const EntityTypeEnum = EntityTypeSchema.enum
export type EntityType = z.infer<typeof EntityTypeSchema>
export const LIST_ENTITY_TYPE = Object.values(EntityTypeEnum)

export type SortField = "identifier" | "status" | "lastViewed" | "createdAt"
export type SortDirection = "asc" | "desc" | null
export type ViewMode = "cards" | "rows"
