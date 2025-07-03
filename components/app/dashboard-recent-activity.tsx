"use client"

import Link from "next/link"
import { RecentItem } from "@/schemas/utils"

import {
  convertActivityTypeToString,
  convertRecentItemTypeToString,
} from "@/config/converter"
import { siteConfig } from "@/config/site"
import { formatDate, formatFullDate } from "@/lib/utils"

import { AddItemDropdown } from "@/components/shared/add-item-dropdown"
import { getEntityIcon, Icons } from "@/components/shared/icons"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DashboardRecentActivityProps {
  recentItems: RecentItem[]
}

export function DashboardRecentActivity({
  recentItems,
}: DashboardRecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-mono">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentItems.length > 0 ? (
          <div className="space-y-4">
            {recentItems.map((item: RecentItem) => (
              <div
                key={`${item.type}-${item.id}`}
                className="hover:bg-muted-foreground/10 flex items-center justify-between space-x-4 rounded-md"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full`}
                  >
                    {getEntityIcon(item.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {item.name}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {convertActivityTypeToString(item.activityType)} on{" "}
                      {formatDate(item.lastActivityAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="text-xs ">
                    {convertRecentItemTypeToString(item.type)}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Tooltip>
                      <TooltipTrigger>
                        <Icons.info className="text-muted-foreground size-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <span className="cursor-default">
                          {convertActivityTypeToString(item.activityType)} on{" "}
                          {formatFullDate(item.lastActivityAt)}{" "}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-muted rounded-full p-3">
              <Icons.logo className="text-muted-foreground size-6" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No items yet</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Add your first item to get started with {siteConfig.name}
            </p>
            <div className="mt-4 w-[200px]">
              <AddItemDropdown text="Add your first item" />
            </div>
          </div>
        )}
      </CardContent>

      {recentItems.length > 0 && (
        <CardFooter>
          <Link
            href="/dashboard/logs"
            className={buttonVariants({
              variant: "outline",
              className: "w-full",
            })}
          >
            View all activity
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
