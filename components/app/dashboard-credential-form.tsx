"use client"

import React, { useState } from "react"
import { useCredentialPassword } from "@/orpc/hooks/use-credentials"
import type { CredentialFormDto } from "@/schemas/credential/credential"
import type { CredentialOutput } from "@/schemas/credential/dto"
import { UseFormReturn } from "react-hook-form"

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CredentialFormProps {
  credential?: CredentialOutput
  form: UseFormReturn<CredentialFormDto>
}

export function CredentialForm({ credential, form }: CredentialFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { copy, isCopied } = useCopyToClipboard({ successDuration: 1000 })

  const { register, watch, setValue } = form
  const formData = watch()

  const { data: passwordData, isLoading: isLoadingPassword } =
    useCredentialPassword(
      credential?.id || "",
      showPassword && Boolean(credential?.id)
    )

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword)
  }

  const handleCopy = async (text: string) => {
    await copy(text)
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-foreground text-sm font-medium">
            Identifier
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Icons.helpCircle className="text-muted-foreground size-3" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                The username, email, or unique identifier for this credential
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="relative">
          <Input
            {...register("identifier")}
            className="border-border focus:border-ring focus:ring-ring pr-8 focus:ring-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:bg-muted absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => handleCopy(formData.identifier)}
          >
            {isCopied ? (
              <Icons.check className="size-4" />
            ) : (
              <Icons.copy className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-foreground text-sm font-medium">
            Password
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Icons.helpCircle className="text-muted-foreground size-3" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                The password is encrypted and stored securely. Click the eye
                icon to reveal it.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={showPassword ? passwordData?.password || "" : "••••••••••••"}
            readOnly
            className="border-border focus:border-ring focus:ring-ring pr-16 focus:ring-1"
          />
          <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-muted"
              onClick={() => handleCopy(passwordData?.password || "")}
              disabled={!showPassword || !passwordData?.password}
            >
              <Icons.copy className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-muted"
              onClick={handlePasswordToggle}
              disabled={isLoadingPassword}
            >
              {isLoadingPassword ? (
                <div className="border-muted-foreground size-4 animate-spin rounded-full border border-t-transparent" />
              ) : showPassword ? (
                <Icons.eyeOff className="size-4" />
              ) : (
                <Icons.eye className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-foreground text-sm font-medium">
            Description
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Icons.helpCircle className="text-muted-foreground size-3" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Add notes or context about this credential to help you remember
                its purpose
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Textarea
          {...register("description")}
          placeholder="Add a description for this credential..."
          className="border-border focus:border-ring focus:ring-ring min-h-[80px] resize-none focus:ring-1"
        />
      </div>

      {/* Security Settings */}
      <div className="space-y-3 pt-2">
        <Label className="text-foreground text-sm font-medium">
          Security Settings
        </Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium">Password Protection</div>
              <div className="text-muted-foreground text-xs">
                Require password for access
              </div>
            </div>
            <Switch
              checked={formData.passwordProtection}
              onCheckedChange={(checked) =>
                setValue("passwordProtection", checked, { shouldDirty: true })
              }
            />
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium">
                Two-Factor Authentication
              </div>
              <div className="text-muted-foreground text-xs">
                Enhanced security verification
              </div>
            </div>
            <Switch
              checked={formData.twoFactorAuth}
              onCheckedChange={(checked) =>
                setValue("twoFactorAuth", checked, { shouldDirty: true })
              }
            />
          </div>
          <Separator className="bg-border" />
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium">Access Logging</div>
              <div className="text-muted-foreground text-xs">
                Track credential usage
              </div>
            </div>
            <Switch
              checked={formData.accessLogging}
              onCheckedChange={(checked) =>
                setValue("accessLogging", checked, { shouldDirty: true })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
