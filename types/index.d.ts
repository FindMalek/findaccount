import type { Icon } from "lucide-react"

import { Icons } from "@/components/shared/icons"

export * from "./dashboard"
export * from "./entity"
export * from "./common"

export type NavItem = {
  title: string
  href: string
  disabled?: boolean
}

export type MainNavItem = NavItem

export type SidebarNavItem = {
  title: string
  disabled?: boolean
  external?: boolean
  icon?: keyof typeof Icons
} & (
  | {
      href: string
      items?: never
    }
  | {
      href?: string
      items: NavLink[]
    }
)

export type SiteConfig = {
  name: string
  description: string
  url: string
  links: {
    twitter?: string
    github: string
    discord?: string
  }
  images: {
    default: string
    notFound: string
    logo: string
  }
  author: {
    name: string
    url: string
    email: string
    github?: string
  }
  keywords: string[]
}

export interface KeyValuePair {
  key: string
  value: string
}
