"use client"

import { useState } from "react"
import { usePlatforms } from "@/orpc/hooks/use-platforms"
import { AccountStatusInfer } from "@/schemas/credential/credential"
import type { CredentialOutput } from "@/schemas/credential/dto"
import { EntityTypeEnum } from "@/schemas/utils"

import { statusConfig } from "@/config/converter"
import { getFullFormattedDateAndTime, getRelativeTime } from "@/lib/date-utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

import { ContainerSelector } from "@/components/shared/container-selector"
import { Icons } from "@/components/shared/icons"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CredentialSidebarProps {
  credential: CredentialOutput
  onStatusChange?: (status: AccountStatusInfer) => void
  onContainerChange?: (containerId: string) => void
}

export function CredentialSidebar({
  credential,
  onStatusChange,
  onContainerChange,
}: CredentialSidebarProps) {
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false)
  const { copy, isCopied } = useCopyToClipboard({ successDuration: 1500 })

  const { data: platformsData } = usePlatforms({ page: 1, limit: 100 })

  const platform = platformsData?.platforms.find(
    (p) => p.id === credential.platformId
  )

  const handleStatusChange = async (newStatus: AccountStatusInfer) => {
    if (onStatusChange && newStatus !== credential.status) {
      setIsChangingStatus(true)
      try {
        await onStatusChange(newStatus)
        setStatusPopoverOpen(false)
      } finally {
        setIsChangingStatus(false)
      }
    }
  }

  const handleCopyIdentifier = async () => {
    await copy(credential.identifier)
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
        <PopoverTrigger asChild>
          <div className="w-full cursor-pointer">
            <StatusBadge status={credential.status} withPopover isFullWidth />
          </div>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-40 p-0">
          <div className="space-y-1">
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => handleStatusChange(status as AccountStatusInfer)}
                disabled={status === credential.status || isChangingStatus}
              >
                <config.icon className="size-3" />
                {config.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCopyIdentifier}
            >
              {isCopied ? (
                <Icons.check className="text-success mr-2 size-4" />
              ) : (
                <Icons.copy className="mr-2 size-4" />
              )}
              Copy ID
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy identifier to clipboard</p>
          </TooltipContent>
        </Tooltip>

        {platform?.loginUrl && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(platform.loginUrl, "_blank")}
              >
                <Icons.link className="mr-2 size-4" />
                Open
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open platform login page</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Container Section */}
      <div className="space-y-3">
        <ContainerSelector
          currentContainerId={credential.containerId}
          entityType={EntityTypeEnum.CREDENTIAL}
          onContainerChange={onContainerChange}
        />
      </div>

      <Separator />

      {/* Timeline */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Timeline</Label>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Created</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-medium hover:underline">
                  {getRelativeTime(credential.createdAt)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getFullFormattedDateAndTime(credential.createdAt)}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {credential.updatedAt.getTime() !==
            credential.createdAt.getTime() && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Modified</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium hover:underline">
                    {getRelativeTime(credential.updatedAt)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getFullFormattedDateAndTime(credential.updatedAt)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {credential.lastViewed && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last viewed</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium hover:underline">
                    {getRelativeTime(credential.lastViewed)}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getFullFormattedDateAndTime(credential.lastViewed)}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
