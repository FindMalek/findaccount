"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { checkIsActive } from "@/lib/utils"

import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DashboardSidebarMenuItemProps {
  href: string
  icon: React.ReactNode
  label: string
}

export function DashboardSidebarMenuItemComponent({
  href,
  icon,
  label,
}: DashboardSidebarMenuItemProps) {
  const pathname = usePathname()
  const { state, isMobile } = useSidebar()
  const isCollapsed = !isMobile && state === "collapsed"
  const pathIsActive = checkIsActive(pathname, href)

  return (
    <SidebarMenuItem>
      <Tooltip open={isCollapsed ? undefined : false} delayDuration={0}>
        <TooltipTrigger asChild>
          <Link href={href}>
            <SidebarMenuButton isActive={pathIsActive}>
              {icon}
              {!isCollapsed && <span>{label}</span>}
            </SidebarMenuButton>
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" sideOffset={5}>
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </SidebarMenuItem>
  )
}
