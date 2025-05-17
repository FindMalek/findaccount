import { CardSimpleRo } from "@/schemas/card"
import { CredentialSimpleRo } from "@/schemas/credential"
import { SecretSimpleRo } from "@/schemas/secret"
import {
  ActivityType,
  ActivityTypeEnum,
  RawEntity,
  RecentItemBase,
  RecentItemType,
  RecentItemTypeEnum,
} from "@/schemas/utils"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { User as UserType } from "@/types/dashboard"

import { PRIORITY_ACTIVITY_TYPE } from "@/config/consts"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  if (typeof date === "string") {
    date = new Date(date)
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function getAvatarOrFallback(user: UserType) {
  if (!user.image) {
    return `https://avatar.vercel.sh/${user.name}`
  }

  return user.image
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function sortByPriority(
  activities: { date: Date; type: ActivityType }[]
) {
  return [...activities].sort((a, b) => {
    const priorityA = PRIORITY_ACTIVITY_TYPE[a.type] ?? 99
    const priorityB = PRIORITY_ACTIVITY_TYPE[b.type] ?? 99
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }
    return b.date.getTime() - a.date.getTime()
  })
}

export function getItemName(entity: RawEntity, type: RecentItemType): string {
  switch (type) {
    case RecentItemTypeEnum.CREDENTIAL:
      return (entity as CredentialSimpleRo).username
    case RecentItemTypeEnum.CARD:
      return (entity as CardSimpleRo).name
    case RecentItemTypeEnum.SECRET:
      return (entity as SecretSimpleRo).name
  }
}

export function mapItem(
  rawItem: RawEntity,
  itemType: RecentItemType
): RecentItemBase {
  const createdAtDate = new Date(rawItem.createdAt)
  const updatedAtDate = new Date(rawItem.updatedAt)

  const potentialActivities: {
    date: Date
    type: ActivityType
  }[] = [
    { date: createdAtDate, type: ActivityTypeEnum.CREATED },
    { date: updatedAtDate, type: ActivityTypeEnum.UPDATED },
  ]

  const sortedActivities = sortByPriority(potentialActivities)

  const lastActivity = sortedActivities[0] || {
    date: updatedAtDate,
    type: ActivityTypeEnum.UPDATED,
  }

  return {
    id: rawItem.id,
    createdAt: createdAtDate,
    updatedAt: updatedAtDate,
    name: getItemName(rawItem, itemType),
    lastActivityAt: lastActivity.date,
    activityType: lastActivity.type,
  }
}

export function checkIsActive(
  currentPathname: string,
  linkHref: string
): boolean {
  return currentPathname === linkHref
}

export function formatFullDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date(date))
}
