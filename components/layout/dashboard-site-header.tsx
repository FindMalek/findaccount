"use client"

import { DashboardDynamicBreadcrumb } from "@/components/layout/dashboard-dynamic-breadcrumb"
import { DashboardSearchCombobox } from "@/components/layout/dashboard-search-combobox"
import { AddItemDropdown } from "@/components/shared/add-item-dropdown"
import { ModeToggle } from "@/components/shared/mode-toggle"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardSiteHeader() {
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b pr-4 transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <DashboardDynamicBreadcrumb />
      </div>
      <DashboardSearchCombobox />
      <ModeToggle />
      <AddItemDropdown className="w-fit" />
    </header>
  )
}
