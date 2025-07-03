"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { capitalizeFirstLetter } from "@/lib/utils"
import {
  getResourceType,
  isIndividualResourcePage,
} from "@/lib/utils/breadcrumb-helpers"

import { Icons } from "@/components/shared/icons"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import { BreadcrumbResourceSelect } from "./breadcrumb-resource-select"

export function DashboardDynamicBreadcrumb() {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter((segment) => segment !== "")

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`
          const isLast = index === pathSegments.length - 1

          // Check if this is an individual resource page
          const isIndividualPage = isIndividualResourcePage(pathSegments, index)
          const resourceType = isIndividualPage
            ? getResourceType(pathSegments[index - 1])
            : null

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  isIndividualPage && resourceType ? (
                    <BreadcrumbResourceSelect
                      resourceType={resourceType}
                      currentId={segment}
                      basePath={`/${pathSegments.slice(0, index).join("/")}`}
                    />
                  ) : (
                    <BreadcrumbPage>
                      {capitalizeFirstLetter(segment)}
                    </BreadcrumbPage>
                  )
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{capitalizeFirstLetter(segment)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator>
                  <Icons.chevronRight className="size-4" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
