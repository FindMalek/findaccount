import { CredentialEntity } from "@/entities/credential"
import { accountStatusEnum } from "@/schemas/credential"
import {
  ActivityType,
  ActivityTypeEnum,
  RecentItemType,
  RecentItemTypeEnum,
} from "@/schemas/utils"

import { Icons } from "@/components/shared/icons"

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

export const statusConfig = {
  [accountStatusEnum.ACTIVE]: {
    label: CredentialEntity.convertAccountStatusToString(
      accountStatusEnum.ACTIVE
    ),
    icon: Icons.check,
  },
  [accountStatusEnum.SUSPENDED]: {
    label: CredentialEntity.convertAccountStatusToString(
      accountStatusEnum.SUSPENDED
    ),
    icon: Icons.warning,
  },
  [accountStatusEnum.DELETED]: {
    label: CredentialEntity.convertAccountStatusToString(
      accountStatusEnum.DELETED
    ),
    icon: Icons.trash,
  },
}
