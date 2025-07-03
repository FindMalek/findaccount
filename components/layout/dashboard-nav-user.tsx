"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { User as UserType } from "@/types/dashboard"

import { signOut } from "@/lib/auth/client"
import { getAvatarOrFallback } from "@/lib/utils"

import { Icons } from "@/components/shared/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DashboardNavUserProps {
  user: UserType
}

export function DashboardNavUser({ user }: DashboardNavUserProps) {
  const router = useRouter()
  const { state, isMobile } = useSidebar()
  const trulyCollapsed = !isMobile && state === "collapsed"

  async function handleSignOut() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
        },
      },
    })
  }

  const userAvatarContent = !trulyCollapsed ? (
    <>
      <Avatar className="size-8 rounded-lg">
        <AvatarImage src={getAvatarOrFallback(user)} alt={user.name} />
        <AvatarFallback className="rounded-lg">
          {user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="text-muted-foreground truncate text-xs">
          {user.email}
        </span>
      </div>
      <Icons.more className="ml-auto size-4" />
    </>
  ) : (
    <Avatar className="size-8 rounded-lg">
      <AvatarImage src={getAvatarOrFallback(user)} alt={user.name} />
      <AvatarFallback className="rounded-lg">
        {user.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  )

  const dropdownMenuLabelContent = (
    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
      <Avatar className="size-8 rounded-lg">
        <AvatarImage src={getAvatarOrFallback(user)} alt={user.name} />
        <AvatarFallback className="rounded-lg">
          {user.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user.name}</span>
        <span className="text-muted-foreground truncate text-xs">
          {user.email}
        </span>
      </div>
    </div>
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip
              open={trulyCollapsed ? undefined : false}
              delayDuration={0}
            >
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground grayscale transition-all duration-300 hover:grayscale-0"
                  >
                    {userAvatarContent}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              {trulyCollapsed && (
                <TooltipContent side="right" sideOffset={5}>
                  <p>{user.name}</p>
                  <p className="text-muted-foreground text-xs">{user.email}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              {dropdownMenuLabelContent}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/account">
                  <Icons.user />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/billing">
                  <Icons.creditCard />
                  Billing
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <Icons.logOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
