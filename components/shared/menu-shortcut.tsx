import React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const menuShortcutVariants = cva(
  "ml-auto rounded-sm px-2 py-0.5 text-xs font-medium tracking-wider",
  {
    variants: {
      variant: {
        default: "text-muted-foreground bg-muted-foreground/10",
        destructive:
          "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface MenuShortcutProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof menuShortcutVariants> {
  children: React.ReactNode
}

export function MenuShortcut({
  className,
  variant,
  children,
  ...props
}: MenuShortcutProps) {
  return (
    <span
      data-slot="menu-shortcut"
      className={cn(menuShortcutVariants({ variant, className }))}
      {...props}
    >
      {children}
    </span>
  )
}
