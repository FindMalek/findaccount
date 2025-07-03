"use client"

import type { CredentialOutput } from "@/schemas/credential/dto"
import type { PlatformSimpleRo } from "@/schemas/utils/platform"
import { format } from "date-fns"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

import { Icons } from "@/components/shared/icons"
import { ItemActionsDropdown } from "@/components/shared/item-actions-dropdown"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface CredentialGridViewProps {
  credentials: CredentialOutput[]
  platforms: PlatformSimpleRo[]
}

export function DashboardCredentialGridView({
  credentials,
  platforms,
}: CredentialGridViewProps) {
  const { copy, isCopied } = useCopyToClipboard({ successDuration: 1000 })

  const getPlatformName = (platformId: string) => {
    const platform = platforms.find((p) => p.id === platformId)
    return platform?.name || "Unknown Platform"
  }

  const handleCopy = async (text: string) => {
    await copy(text)
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {credentials.map((credential) => (
        <Card key={credential.id} className="transition-shadow hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Icons.user className="size-4 text-gray-600" />
                </div>
                <div>
                  <h3 className="max-w-[150px] truncate text-sm font-semibold">
                    {credential.identifier}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {getPlatformName(credential.platformId)}
                  </p>
                </div>
              </div>
              <StatusBadge status={credential.status} compact />
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            {credential.description && (
              <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                {credential.description}
              </p>
            )}

            <div className="mb-4 space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Created:</span>
                <span>
                  {format(new Date(credential.createdAt), "MMM dd, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Viewed:</span>
                <span>
                  {credential.lastViewed
                    ? format(new Date(credential.lastViewed), "MMM dd, yyyy")
                    : "Never"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(credential.identifier)}
              >
                {isCopied ? (
                  <Icons.check className="size-4" />
                ) : (
                  <Icons.copy className="size-4" />
                )}
              </Button>

              <ItemActionsDropdown
                onEdit={() => {
                  // TODO: Implement edit
                }}
                onShare={() => {
                  // TODO: Implement share
                }}
                onDuplicate={() => {
                  // TODO: Implement duplicate
                }}
                onMove={() => {
                  // TODO: Implement move
                }}
                onArchive={() => {
                  // TODO: Implement archive
                }}
                onDelete={() => {
                  // TODO: Implement delete
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
