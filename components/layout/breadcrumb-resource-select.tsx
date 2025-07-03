"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCards } from "@/orpc/hooks/use-cards"
import { useCredentials } from "@/orpc/hooks/use-credentials"
import { usePlatforms } from "@/orpc/hooks/use-platforms"
import { useSecrets } from "@/orpc/hooks/use-secrets"

import { getLogoDevUrlWithToken, getPlaceholderImage } from "@/lib/utils"
import type { ResourceType } from "@/lib/utils/breadcrumb-helpers"

import { Icons } from "@/components/shared/icons"
import { BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"

interface ResourceSelectProps {
  resourceType: ResourceType
  currentId: string
  basePath: string
}

export function BreadcrumbResourceSelect({
  resourceType,
  currentId,
  basePath,
}: ResourceSelectProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Conditionally fetch data based on resource type
  const shouldFetchCredentials = resourceType === "accounts"
  const shouldFetchCards = resourceType === "cards"
  const shouldFetchSecrets = resourceType === "secrets"

  const { data: credentials, isLoading: isLoadingCredentials } = useCredentials(
    { page: 1, limit: 100 },
    { enabled: shouldFetchCredentials }
  )

  const { data: cards, isLoading: isLoadingCards } = useCards(
    {
      page: 1,
      limit: 100,
    },
    { enabled: shouldFetchCards }
  )

  const { data: secrets, isLoading: isLoadingSecrets } = useSecrets(
    {
      page: 1,
      limit: 100,
    },
    { enabled: shouldFetchSecrets }
  )

  // Only fetch platforms when needed for accounts
  const { data: platforms } = usePlatforms(
    {
      page: 1,
      limit: 100,
    },
    { enabled: shouldFetchCredentials }
  )

  // Helper function to get platform info
  const getPlatform = (platformId: string) => {
    return (
      platforms?.platforms.find((p) => p.id === platformId) || {
        id: platformId,
        name: "unknown",
        logo: "",
      }
    )
  }

  // Get the appropriate data and loading state
  let items: Array<{
    id: string
    name: string
    logo?: string
    platformName?: string
  }> = []
  let isLoading = false
  let currentItem:
    | { id: string; name: string; logo?: string; platformName?: string }
    | undefined

  switch (resourceType) {
    case "accounts":
      isLoading = isLoadingCredentials
      if (credentials?.credentials) {
        items = credentials.credentials.map((cred) => {
          const platform = getPlatform(cred.platformId)
          return {
            id: cred.id,
            name: cred.identifier,
            logo: platform.logo,
            platformName: platform.name,
          }
        })
        currentItem = items.find((item) => item.id === currentId)
      }
      break
    case "cards":
      isLoading = isLoadingCards
      if (cards?.cards) {
        items = cards.cards.map((card) => ({
          id: card.id,
          name: card.name,
        }))
        currentItem = items.find((item) => item.id === currentId)
      }
      break
    case "secrets":
      isLoading = isLoadingSecrets
      if (secrets?.secrets) {
        items = secrets.secrets.map((secret) => ({
          id: secret.id,
          name: secret.name,
        }))
        currentItem = items.find((item) => item.id === currentId)
      }
      break
  }

  const handleSelect = (newId: string) => {
    if (newId !== currentId) {
      router.push(`${basePath}/${newId}`)
    }
    setOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex max-w-[200px] items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          {resourceType === "accounts" && (
            <Skeleton className="size-4 shrink-0 rounded-full" />
          )}
          <Skeleton className="size-4 min-w-[120px] flex-1" />
        </div>
        <Icons.chevronDown className="ml-2 size-4 shrink-0" />
      </div>
    )
  }

  if (!currentItem) {
    return <BreadcrumbPage>{currentId}</BreadcrumbPage>
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="hover:bg-accent hover:text-accent-foreground h-auto justify-between border-0 bg-transparent p-0 font-medium focus:ring-0 focus:ring-offset-0"
        >
          <div className="flex max-w-[200px] items-center gap-2 truncate">
            {currentItem.logo && (
              <Image
                src={getPlaceholderImage(
                  currentItem.platformName || "unknown",
                  getLogoDevUrlWithToken(currentItem.logo)
                )}
                alt={`${currentItem.platformName || "unknown"} logo`}
                width={16}
                height={16}
                className="bg-secondary size-4 shrink-0 rounded-full object-contain p-0.5"
              />
            )}
            <span className="truncate">{currentItem.name}</span>
          </div>
          <Icons.chevronDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${resourceType}...`} />
          <CommandList>
            <CommandEmpty>No {resourceType} found.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => handleSelect(item.id)}
                  className="cursor-pointer"
                >
                  <div className="flex w-full items-center gap-2">
                    {item.logo && (
                      <Image
                        src={getPlaceholderImage(
                          item.platformName || "unknown",
                          getLogoDevUrlWithToken(item.logo)
                        )}
                        alt={`${item.platformName || "unknown"} logo`}
                        width={16}
                        height={16}
                        className="bg-secondary size-4 shrink-0 rounded-full object-contain p-0.5"
                      />
                    )}
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.id === currentId && (
                      <Icons.check className="text-primary size-4 shrink-0" />
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
