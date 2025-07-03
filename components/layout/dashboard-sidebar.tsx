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
  SidebarSeparator,
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
                <Icons.logo className="size-5" />
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
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarSeparator />
              <DashboardSidebarMenuItemComponent
                href="/dashboard"
                icon={<Icons.home className="size-4" />}
                label="Overview"
              />

              <SidebarSeparator />
              <SidebarGroupLabel>
                <span>Applications</span>
              </SidebarGroupLabel>

              <DashboardSidebarMenuItemComponent
                href="/dashboard/accounts"
                icon={<Icons.user className="size-4" />}
                label="Accounts"
              />
              <DashboardSidebarMenuItemComponent
                href="/dashboard/cards"
                icon={<Icons.creditCard className="size-4" />}
                label="Payment Cards"
              />
              <DashboardSidebarMenuItemComponent
                href="/dashboard/secrets"
                icon={<Icons.key className="size-4" />}
                label="Secure Notes"
              />

              <SidebarSeparator />
              <SidebarGroupLabel>
                <span>Library</span>
              </SidebarGroupLabel>

              <DashboardSidebarMenuItemComponent
                href="/dashboard/platforms"
                icon={<Icons.platform className="size-4" />}
                label="Platforms"
              />
              <DashboardSidebarMenuItemComponent
                href="/dashboard/containers"
                icon={<Icons.folder className="size-4" />}
                label="Containers"
              />

              <DashboardSidebarMenuItemComponent
                href="/dashboard/tags"
                icon={<Icons.tag className="size-4" />}
                label="Tags"
              />

              <SidebarSeparator />
              <SidebarGroupLabel>
                <span>Lifecycle</span>
              </SidebarGroupLabel>

              <DashboardSidebarMenuItemComponent
                href="/dashboard/logs"
                icon={<Icons.logs className="size-4" />}
                label="Logs"
              />

              <DashboardSidebarMenuItemComponent
                href="/dashboard/iv"
                icon={<Icons.iv className="size-4" />}
                label="Initialized Vectors"
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <DashboardNavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
