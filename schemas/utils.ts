import { CardSimpleRo, CardSimpleRoSchema } from "@/schemas/card"
import {
  CredentialSimpleRo,
  CredentialSimpleRoSchema,
} from "@/schemas/credential"
import { SecretSimpleRo, SecretSimpleRoSchema } from "@/schemas/secret"
import { z } from "zod"

export const ActivityTypeSchema = z.enum(["CREATED", "UPDATED", "COPIED"])
export const ActivityTypeEnum = ActivityTypeSchema.enum
export type ActivityType = z.infer<typeof ActivityTypeSchema>

export const RecentItemTypeSchema = z.enum(["CREDENTIAL", "CARD", "SECRET"])
export const RecentItemTypeEnum = RecentItemTypeSchema.enum
export type RecentItemType = z.infer<typeof RecentItemTypeSchema>

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
  entity: CredentialSimpleRoSchema,
})

export type RecentCredentialItem = z.infer<typeof RecentCredentialItemSchema>

export const RecentCardItemSchema = RecentItemBaseSchema.extend({
  type: z.literal(RecentItemTypeEnum.CARD),
  entity: CardSimpleRoSchema,
})

export type RecentCardItem = z.infer<typeof RecentCardItemSchema>

export const RecentSecretItemSchema = RecentItemBaseSchema.extend({
  type: z.literal(RecentItemTypeEnum.SECRET),
  entity: SecretSimpleRoSchema,
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
