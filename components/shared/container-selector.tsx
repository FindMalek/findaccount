"use client"

import { useState } from "react"
import { useContainers } from "@/orpc/hooks/use-containers"
import { EntityType } from "@/schemas/utils"

import { validateEntityForContainer } from "@/lib/utils"

import { DashboardCreateContainerDialog } from "@/components/app/dashboard-create-container-dialog"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

interface ContainerSelectorProps {
  currentContainerId?: string | null
  entityType: EntityType
  onContainerChange?: (containerId: string) => void
  disabled?: boolean
  className?: string
}

export function ContainerSelector({
  currentContainerId,
  entityType,
  onContainerChange,
  disabled = false,
  className,
}: ContainerSelectorProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: containersData, refetch } = useContainers({
    page: 1,
    limit: 50,
  })

  const containers = containersData?.containers || []
  const currentContainer = containers.find((c) => c.id === currentContainerId)

  // Filter containers that can accept this entity type and match search
  const compatibleContainers = containers
    .filter((container) =>
      validateEntityForContainer(container.type, entityType)
    )
    .filter(
      (container) =>
        container.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        container.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleContainerChange = async (containerId: string) => {
    if (onContainerChange && containerId !== currentContainerId) {
      await onContainerChange(containerId)
      setPopoverOpen(false)
    }
  }

  const handleContainerCreated = async (containerId: string) => {
    await refetch()
    if (onContainerChange) {
      await handleContainerChange(containerId)
    }
  }

  return (
    <>
      <div className={className}>
        {currentContainer ? (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="border-border bg-card hover:bg-accent w-full rounded-lg border p-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{currentContainer.icon}</span>
                    <p className="text-sm font-medium">
                      {currentContainer.name}
                    </p>
                  </div>
                  <Icons.chevronDown className="text-muted-foreground size-3" />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0">
              <div className="space-y-3 p-3">
                {/* Search Bar */}
                <div className="relative">
                  <Icons.search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
                  <Input
                    placeholder="Search containers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-9"
                  />
                </div>

                {/* Compatible Containers */}
                {compatibleContainers.length > 0 ? (
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {compatibleContainers.map((container) => (
                      <Button
                        key={container.id}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-full justify-start gap-2 p-2 text-xs"
                        onClick={() => handleContainerChange(container.id)}
                        disabled={container.id === currentContainerId}
                      >
                        <span className="text-sm">{container.icon}</span>
                        <span className="truncate font-medium">
                          {container.name}
                        </span>
                        {container.id === currentContainerId && (
                          <Icons.check className="ml-auto size-3 text-emerald-600" />
                        )}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground py-6 text-center text-sm">
                    {searchQuery
                      ? "No containers found"
                      : "No compatible containers available"}
                  </div>
                )}
              </div>

              <Separator />

              {/* Create Container Button */}
              <div className="p-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => {
                    setCreateDialogOpen(true)
                    setPopoverOpen(false)
                  }}
                >
                  <Icons.add className="size-4" />
                  Create Container
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        ) : (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="border-muted-foreground/25 bg-muted/10 hover:bg-muted/20 w-full rounded-lg border border-dashed p-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                disabled={disabled}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icons.folder className="text-muted-foreground size-4" />
                    <span className="text-muted-foreground text-sm">
                      No container assigned
                    </span>
                  </div>
                  <Icons.chevronDown className="text-muted-foreground size-3" />
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0">
              <div className="space-y-3 p-3">
                {/* Search Bar */}
                <div className="relative">
                  <Icons.search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
                  <Input
                    placeholder="Search containers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-9"
                  />
                </div>

                {/* Compatible Containers */}
                {compatibleContainers.length > 0 ? (
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {compatibleContainers.map((container) => (
                      <Button
                        key={container.id}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-full justify-start gap-2 p-2 text-xs"
                        onClick={() => handleContainerChange(container.id)}
                      >
                        <span className="text-sm">{container.icon}</span>
                        <span className="truncate font-medium">
                          {container.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground py-6 text-center text-sm">
                    {searchQuery
                      ? "No containers found"
                      : "No compatible containers available"}
                  </div>
                )}
              </div>

              <Separator />

              {/* Create Container Button */}
              <div className="p-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => {
                    setCreateDialogOpen(true)
                    setPopoverOpen(false)
                  }}
                >
                  <Icons.add className="size-4" />
                  Create Container
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <DashboardCreateContainerDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onContainerCreated={handleContainerCreated}
      />
    </>
  )
}
