"use client"

import * as React from "react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface ResponsiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface ResponsiveDialogContentProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveDialogHeaderProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveDialogTitleProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveDialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveDialogCloseProps {
  className?: string
  children?: React.ReactNode
  asChild?: boolean
}

interface ResponsiveDialogBodyProps {
  className?: string
  children: React.ReactNode
}

interface ResponsiveDialogFooterProps {
  className?: string
  children: React.ReactNode
}

const ResponsiveDialogContext = React.createContext<{
  isMobile: boolean
}>({
  isMobile: false,
})

function ResponsiveDialog({ open, onOpenChange, children }: ResponsiveDialogProps) {
  const isMobile = useIsMobile()

  const contextValue = React.useMemo(
    () => ({
      isMobile,
    }),
    [isMobile]
  )

  if (isMobile) {
    return (
      <ResponsiveDialogContext.Provider value={contextValue}>
        <Drawer open={open} onOpenChange={onOpenChange}>
          {children}
        </Drawer>
      </ResponsiveDialogContext.Provider>
    )
  }

  return (
    <ResponsiveDialogContext.Provider value={contextValue}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      </Dialog>
    </ResponsiveDialogContext.Provider>
  )
}

function ResponsiveDialogContent({ className, children }: ResponsiveDialogContentProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  if (isMobile) {
    return (
      <DrawerContent className={cn("max-h-[90vh] flex flex-col", className)}>
        {children}
      </DrawerContent>
    )
  }

  return (
    <DialogContent className={cn("sm:max-w-[800px] max-h-[90vh] overflow-y-auto", className)}>
      {children}
    </DialogContent>
  )
}

function ResponsiveDialogHeader({ className, children }: ResponsiveDialogHeaderProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  if (isMobile) {
    return (
      <DrawerHeader className={cn("text-left pb-4", className)}>
        {children}
      </DrawerHeader>
    )
  }

  return (
    <DialogHeader className={className}>
      {children}
    </DialogHeader>
  )
}

function ResponsiveDialogTitle({ className, children }: ResponsiveDialogTitleProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  if (isMobile) {
    return (
      <DrawerTitle className={cn("text-lg font-semibold", className)}>
        {children}
      </DrawerTitle>
    )
  }

  return (
    <DialogTitle className={className}>
      {children}
    </DialogTitle>
  )
}

function ResponsiveDialogDescription({ className, children }: ResponsiveDialogDescriptionProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  if (isMobile) {
    return (
      <DrawerDescription className={cn("text-sm text-muted-foreground", className)}>
        {children}
      </DrawerDescription>
    )
  }

  return (
    <DialogDescription className={className}>
      {children}
    </DialogDescription>
  )
}

function ResponsiveDialogBody({ className, children }: ResponsiveDialogBodyProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  if (isMobile) {
    return (
      <div className={cn("flex-1 overflow-y-auto px-4 space-y-4", className)}>
        {children}
      </div>
    )
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}

function ResponsiveDialogFooter({ className, children }: ResponsiveDialogFooterProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  if (isMobile) {
    return (
      <DrawerFooter className={cn("px-4 pb-4 pt-2 border-t", className)}>
        {children}
      </DrawerFooter>
    )
  }

  return (
    <DialogFooter className={className}>
      {children}
    </DialogFooter>
  )
}

function ResponsiveDialogClose({ className, children, asChild }: ResponsiveDialogCloseProps) {
  const { isMobile } = React.useContext(ResponsiveDialogContext)

  if (isMobile) {
    return (
      <DrawerClose className={className} asChild={asChild}>
        {children}
      </DrawerClose>
    )
  }

  return (
    <DialogClose className={className} asChild={asChild}>
      {children}
    </DialogClose>
  )
}

export {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogFooter,
} 