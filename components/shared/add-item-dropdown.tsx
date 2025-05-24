"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

import { DashboardAddCardDialog } from "@/components/app/dashboard-add-card-dialog"
import { DashboardAddCredentialDialog } from "@/components/app/dashboard-add-credential-dialog"
import { DashboardAddSecretDialog } from "@/components/app/dashboard-add-secret-dialog"
import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AddItemDropdownProps {
  text?: string
  className?: string
}

export function AddItemDropdown({ text, className }: AddItemDropdownProps) {
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [cardDialogOpen, setCardDialogOpen] = useState(false)
  const [secretDialogOpen, setSecretDialogOpen] = useState(false)

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className={cn("w-full justify-start gap-2", className)}>
            <Icons.add className="h-4 w-4" />
            {text}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={() => setAccountDialogOpen(true)}>
            <Icons.user className="mr-2 h-4 w-4" />
            <span>New Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setCardDialogOpen(true)}>
            <Icons.creditCard className="mr-2 h-4 w-4" />
            <span>New Payment Card</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setSecretDialogOpen(true)}>
            <Icons.key className="mr-2 h-4 w-4" />
            <span>New Secure Note</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DashboardAddCredentialDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
      />

      <DashboardAddCardDialog
        open={cardDialogOpen}
        onOpenChange={setCardDialogOpen}
      />

      <DashboardAddSecretDialog
        open={secretDialogOpen}
        onOpenChange={setSecretDialogOpen}
      />
    </div>
  )
}
