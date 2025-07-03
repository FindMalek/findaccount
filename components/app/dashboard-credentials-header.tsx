"use client"

import { CredentialEntity } from "@/entities"
import { accountStatusEnum } from "@/schemas/credential"
import type { SortDirection, SortField, ViewMode } from "@/schemas/utils"
import type { PlatformSimpleRo } from "@/schemas/utils/platform"
import { Globe, Tag } from "lucide-react"

import {
  createFilterConfig,
  DashboardMultiFilters,
} from "@/components/shared/dashboard-multi-filters"
import {
  DashboardViewControls,
  type DisplayProperty,
  type SortOption,
} from "@/components/shared/dashboard-view-controls"
import { Icons } from "@/components/shared/icons"
import { Input } from "@/components/ui/input"

interface EntityFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilters: string[]
  onToggleStatusFilter: (status: string) => void
  platformFilters: string[]
  onTogglePlatformFilter: (platform: string) => void
  platforms: PlatformSimpleRo[]
  onClearFilters: () => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortField: SortField | null
  sortDirection: SortDirection
  onSortChange: (field: SortField) => void
  showArchived?: boolean
  onShowArchivedChange?: (show: boolean) => void
}

export function DashboardCredentialsHeader({
  searchTerm,
  onSearchChange,
  statusFilters,
  onToggleStatusFilter,
  platformFilters,
  onTogglePlatformFilter,
  platforms,
  onClearFilters,
  viewMode,
  onViewModeChange,
  sortField,
  sortDirection,
  onSortChange,
  showArchived,
  onShowArchivedChange,
}: EntityFiltersProps) {
  const filters = [
    createFilterConfig(
      "status",
      "Status",
      Tag,
      [
        {
          value: accountStatusEnum.ACTIVE,
          label: CredentialEntity.convertAccountStatusToString(
            accountStatusEnum.ACTIVE
          ),
        },
        {
          value: accountStatusEnum.SUSPENDED,
          label: CredentialEntity.convertAccountStatusToString(
            accountStatusEnum.SUSPENDED
          ),
        },
        {
          value: accountStatusEnum.DELETED,
          label: CredentialEntity.convertAccountStatusToString(
            accountStatusEnum.DELETED
          ),
        },
      ],
      statusFilters,
      onToggleStatusFilter,
      3
    ),
    createFilterConfig(
      "platform",
      "Platform",
      Globe,
      platforms.map((platform) => ({
        value: platform.name,
        label: platform.name,
        logo: platform.logo || undefined,
      })),
      platformFilters,
      onTogglePlatformFilter,
      platforms.length
    ),
  ]

  const sortOptions: SortOption[] = [
    { field: "identifier", label: "Identifier" },
    { field: "status", label: "Status" },
    { field: "lastViewed", label: "Last Viewed" },
    { field: "createdAt", label: "Date Created" },
  ]

  const displayProperties: DisplayProperty[] = [
    {
      id: "identifier",
      label: "Identifier",
      enabled: true,
      onChange: () => {},
    },
    {
      id: "description",
      label: "Description",
      enabled: true,
      onChange: () => {},
    },
    {
      id: "status",
      label: "Status",
      enabled: true,
      onChange: () => {},
    },
    {
      id: "password",
      label: "Password",
      enabled: true,
      onChange: () => {},
    },
    {
      id: "lastViewed",
      label: "Last Viewed",
      enabled: true,
      onChange: () => {},
    },
    {
      id: "createdAt",
      label: "Created Date",
      enabled: true,
      onChange: () => {},
    },
    {
      id: "platform",
      label: "Platform",
      enabled: true,
      onChange: () => {},
    },
  ]

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Icons.search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2 transform" />
        <Input
          placeholder="Search by identifier or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <DashboardMultiFilters filters={filters} onClearAll={onClearFilters} />

      <DashboardViewControls
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        sortField={sortField}
        sortDirection={sortDirection || "asc"}
        onSortChange={(field) => onSortChange(field as SortField)}
        sortOptions={sortOptions}
        showArchived={showArchived}
        onShowArchivedChange={onShowArchivedChange}
        archivedLabel="Show archived credentials"
        displayProperties={displayProperties}
      />
    </div>
  )
}
