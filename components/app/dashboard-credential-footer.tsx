"use client"

import type { CredentialOutput } from "@/schemas/credential/dto"

import { formatDate } from "@/lib/utils"

import { Icons } from "@/components/shared/icons"

interface CredentialFooterProps {
  credential: CredentialOutput
}

export function CredentialFooter({ credential }: CredentialFooterProps) {
  return (
    <div className="text-muted-foreground border-border flex items-center gap-2 border-t pt-6 text-xs">
      <Icons.user className="size-4" />
      <span>Created by System Admin • {formatDate(credential.createdAt)}</span>
    </div>
  )
}
