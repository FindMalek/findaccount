import * as React from "react"
import Link from "next/link"

import { User as UserType } from "@/types"

import { siteConfig } from "@/config/site"

import { DashboardNavUser } from "@/components/layout/dashboard-nav-user"
import { DashboardSidebarMenuItemComponent } from "@/components/layout/dashboard-sidebar-menu-item"
import { Icons } from "@/components/shared/icons"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface DashboardSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: UserType
}

export function DashboardSidebar({ user, ...props }: DashboardSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Icons.logo className="h-5 w-5" />
                <span className="text-base font-semibold">
                  {siteConfig.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Items</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <DashboardSidebarMenuItemComponent
                href="/dashboard"
                icon={<Icons.home className="h-4 w-4" />}
                label="Overview"
              />
              <DashboardSidebarMenuItemComponent
                href="/dashboard/accounts"
                icon={<Icons.user className="h-4 w-4" />}
                label="Accounts"
              />
              <DashboardSidebarMenuItemComponent
                href="/dashboard/cards"
                icon={<Icons.creditCard className="h-4 w-4" />}
                label="Payment Cards"
              />
              <DashboardSidebarMenuItemComponent
                href="/dashboard/secrets"
                icon={<Icons.key className="h-4 w-4" />}
                label="Secure Notes"
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>{" "}
      <SidebarFooter>
        <DashboardNavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
