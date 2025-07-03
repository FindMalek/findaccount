"use client"

import { CredentialEntity } from "@/entities/credential/credential"
import { LIST_ACCOUNT_STATUSES } from "@/schemas/credential"

import { Icons } from "@/components/shared/icons"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EntityFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  platformFilter: string
  onPlatformFilterChange: (value: string) => void
  platforms: string[]
}

export function DashboardCredentialFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  platformFilter,
  onPlatformFilterChange,
  platforms,
}: EntityFiltersProps) {
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

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          {LIST_ACCOUNT_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {CredentialEntity.convertAccountStatusToString(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={platformFilter} onValueChange={onPlatformFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by platform" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Platforms</SelectItem>
          {platforms.map((platform) => (
            <SelectItem key={platform} value={platform}>
              {platform}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
