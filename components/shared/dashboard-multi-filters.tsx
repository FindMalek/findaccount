"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"

import { getLogoDevUrlWithToken, getPlaceholderImage } from "@/lib/utils"

import { Icons } from "@/components/shared/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

type FilterView = "main" | string

export interface FilterOption {
  value: string
  label: string
  logo?: string
}

export interface FilterConfig {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  options: FilterOption[]
  selectedValues: string[]
  onToggle: (value: string) => void
  count?: number
}

export interface DashboardMultiFiltersProps {
  filters: FilterConfig[]
  onClearAll: () => void
  className?: string
}

export function createFilterConfig(
  id: string,
  label: string,
  icon: React.ComponentType<{ className?: string }>,
  options: FilterOption[],
  selectedValues: string[],
  onToggle: (value: string) => void,
  count?: number
): FilterConfig {
  return {
    id,
    label,
    icon,
    options,
    selectedValues,
    onToggle,
    count: count ?? options.length,
  }
}

export function DashboardMultiFilters({
  filters,
  onClearAll,
  className,
}: DashboardMultiFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [currentView, setCurrentView] = useState<FilterView>("main")

  const getActiveFilters = () => {
    const active: Array<{
      type: string
      label: string
      value: string
      filterId: string
      logo?: string
    }> = []

    filters.forEach((filter) => {
      filter.selectedValues.forEach((value) => {
        const option = filter.options.find((opt) => opt.value === value)
        if (option) {
          active.push({
            type: filter.label,
            label: option.label,
            value: value,
            filterId: filter.id,
            logo: option.logo,
          })
        }
      })
    })

    return active
  }

  const activeFilters = getActiveFilters()
  const totalActiveFilters = activeFilters.length

  const handleFilterClick = (filterId: string) => {
    setCurrentView(filterId)
  }

  const handleBackClick = () => {
    setCurrentView("main")
  }

  const removeFilter = (filterId: string, value: string) => {
    const filter = filters.find((f) => f.id === filterId)
    if (filter) {
      filter.onToggle(value)
    }
  }

  const clearAllFilters = () => {
    onClearAll()
    setCurrentView("main")
  }

  const getFilterCount = (filterId: string) => {
    const filter = filters.find((f) => f.id === filterId)
    return filter && filter.selectedValues.length > 0
      ? filter.selectedValues.length
      : undefined
  }

  const renderMainView = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        {filters.map((filter) => {
          const activeCount = getFilterCount(filter.id)
          return (
            <Button
              key={filter.id}
              onClick={() => handleFilterClick(filter.id)}
              variant="outline"
              className="flex w-full items-center justify-between p-3"
            >
              <div className="flex items-center gap-3">
                <filter.icon className="text-muted-foreground size-4" />
                <span className="text-sm font-medium">{filter.label}</span>
                {activeCount && <Badge variant="info">{activeCount}</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {filter.count || filter.options.length}
                </span>
                <Icons.right className="text-muted-foreground size-4" />
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )

  const renderFilterView = (filter: FilterConfig) => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="p-1"
        >
          <Icons.chevronLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <filter.icon className="text-muted-foreground size-4" />
          <span className="text-sm font-medium">{filter.label}</span>
          {filter.selectedValues.length > 0 && (
            <Badge variant="info">{filter.selectedValues.length}</Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {filter.options.map((option) => {
          const isSelected = filter.selectedValues.includes(option.value)
          return (
            <Button
              key={option.value}
              onClick={() => filter.onToggle(option.value)}
              variant={isSelected ? "outline" : "secondary"}
              className="flex w-full items-center justify-between p-3"
            >
              <div className="flex items-center gap-2">
                {option.logo && (
                  <Image
                    src={getPlaceholderImage(
                      option.label,
                      option.logo ? getLogoDevUrlWithToken(option.logo) : null
                    )}
                    alt={`${option.label} logo`}
                    width={16}
                    height={16}
                    className="size-4 rounded-sm object-contain"
                  />
                )}
                <span className="text-sm font-medium">{option.label}</span>
              </div>
              {isSelected && <Icons.check className="text-primary size-4" />}
            </Button>
          )
        })}
      </div>
    </div>
  )

  const renderActiveFilters = () => {
    if (activeFilters.length === 0) return null

    return (
      <div className="space-y-3">
        <Separator className="my-3" />
        <div className="space-y-3">
          <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Active Filters
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <Badge
                key={`${filter.filterId}-${filter.value}-${index}`}
                variant="info"
                className="flex items-center gap-1"
              >
                {filter.label}
                <button
                  onClick={() => removeFilter(filter.filterId, filter.value)}
                  className="ml-1 rounded-full p-0.5 hover:bg-blue-200"
                >
                  <Icons.close className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentFilter = filters.find((f) => f.id === currentView)

  return (
    <div className={className}>
      {/* Filter Dropdown */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Icons.filter className="mr-2 size-4" />
            Filter
            {totalActiveFilters > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                {totalActiveFilters}
              </Badge>
            )}
            <Icons.chevronDown className="ml-2 size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4">
            {currentView === "main" && renderMainView()}
            {currentFilter && renderFilterView(currentFilter)}

            {renderActiveFilters()}

            {totalActiveFilters > 0 && (
              <>
                <Separator className="my-3" />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </Button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
