"use client"

import Image from "next/image"
import Link from "next/link"
import type { CredentialOutput } from "@/schemas/credential/dto"
import { PlatformOutput } from "@/schemas/utils/dto"

import { getLogoDevUrlWithToken, getPlaceholderImage } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useToast } from "@/hooks/use-toast"

import { Icons } from "@/components/shared/icons"
import { ItemActionsDropdown } from "@/components/shared/item-actions-dropdown"
import { Button } from "@/components/ui/button"

interface CredentialHeaderProps {
  credential: CredentialOutput
  platform: PlatformOutput
  onDelete?: () => void
}

export function CredentialHeader({
  credential,
  platform,
  onDelete,
}: CredentialHeaderProps) {
  const { toast } = useToast()
  const { copy, isCopied } = useCopyToClipboard({ successDuration: 2000 })

  const handleCopyLink = async () => {
    await copy(window.location.href)
    toast("Credential link copied to clipboard", "success")
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex-shrink-0">
          <Image
            src={getPlaceholderImage(
              platform.name,
              getLogoDevUrlWithToken(platform.logo)
            )}
            alt={`${platform.name} logo`}
            width={64}
            height={64}
            className="bg-muted ring-border size-16 rounded-xl object-contain p-3 ring-1"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          {platform.loginUrl ? (
            <Link
              href={platform.loginUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary focus:ring-ring group flex items-center gap-1.5 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <span className="text-xs font-medium">{platform.name}</span>
              <Icons.link className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ) : (
            <span className="text-xs font-medium">{platform.name}</span>
          )}
          <h1 className="text-foreground text-xl font-semibold leading-tight sm:text-2xl">
            {credential.identifier}
          </h1>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5"
          onClick={handleCopyLink}
        >
          {isCopied ? (
            <>
              <Icons.check className="mr-1 size-3" />
              <span className="whitespace-nowrap text-xs">Copied</span>
            </>
          ) : (
            <>
              <Icons.copy className="mr-1 size-3" />
              <span className="whitespace-nowrap text-xs">Copy link</span>
            </>
          )}
        </Button>

        <ItemActionsDropdown
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
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}
