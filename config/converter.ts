import {
  ActivityType,
  ActivityTypeEnum,
  RecentItemType,
  RecentItemTypeEnum,
} from "@/schemas/utils"

export function convertActivityTypeToString(
  activityType: ActivityType
): string {
  switch (activityType) {
    case ActivityTypeEnum.CREATED:
      return "Created"
    case ActivityTypeEnum.UPDATED:
      return "Updated"
    case ActivityTypeEnum.COPIED:
      return "Copied"
  }
}

export function convertRecentItemTypeToString(
  recentItemType: RecentItemType
): string {
  switch (recentItemType) {
    case RecentItemTypeEnum.CREDENTIAL:
      return "Credential"
    case RecentItemTypeEnum.CARD:
      return "Card"
    case RecentItemTypeEnum.SECRET:
      return "Secret"
  }
}
