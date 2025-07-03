"use client"

import { ReactNode } from "react"

import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog"
import { Switch } from "@/components/ui/switch"

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
  icon?: ReactNode
  isSubmitting?: boolean
  createMore?: boolean
  onCreateMoreChange?: (value: boolean) => void
  createMoreText?: string
  submitText?: string
  formId?: string
  className?: string
}

export function AddItemDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  icon,
  isSubmitting = false,
  createMore = false,
  onCreateMoreChange,
  createMoreText = "Create another after saving",
  submitText = "Save",
  formId,
  className,
}: AddItemDialogProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className={className}>
        <ResponsiveDialogHeader className="border-b pb-4">
          <ResponsiveDialogTitle className="flex items-center gap-2 font-mono">
            {icon}
            {title}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {description}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody>{children}</ResponsiveDialogBody>

        {(onCreateMoreChange || submitText) && (
          <ResponsiveDialogFooter>
            <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {onCreateMoreChange && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="create-more"
                    checked={createMore}
                    onCheckedChange={onCreateMoreChange}
                  />
                  <label
                    htmlFor="create-more"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    <span className="sm:hidden">{createMoreText}</span>
                    <span className="hidden sm:inline">
                      {createMoreText.includes("after saving")
                        ? createMoreText
                        : `${createMoreText} after saving`}
                    </span>
                  </label>
                </div>
              )}

              {submitText && (
                <Button
                  type="submit"
                  form={formId}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting && (
                    <Icons.spinner className="mr-2 size-4 animate-spin" />
                  )}
                  {submitText}
                </Button>
              )}
            </div>
          </ResponsiveDialogFooter>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
