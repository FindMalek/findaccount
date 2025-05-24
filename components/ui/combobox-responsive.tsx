"use client"

import * as React from "react"
import Image from "next/image"
import { useMediaQuery } from "@/hooks/use-media-query"
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
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Icons } from "@/components/shared/icons"

export type ComboboxItem = {
  value: string
  label: string
  logo?: string
}

interface ComboboxResponsiveProps {
  items: ComboboxItem[]
  selectedItem: ComboboxItem | null
  onSelect: (item: ComboboxItem | null) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
}

export function ComboboxResponsive({
  items,
  selectedItem,
  onSelect,
  placeholder = "Select an item",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
}: ComboboxResponsiveProps) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between ${className}`}
          >
            <div className="flex items-center gap-2">
              {selectedItem?.logo && (
                <Image
                  src={selectedItem.logo}
                  alt={selectedItem.label}
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
              )}
              {selectedItem ? selectedItem.label : placeholder}
            </div>
            <Icons.chevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0" 
          align="start"
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <ComboboxList
            items={items}
            onSelect={onSelect}
            setOpen={setOpen}
            searchPlaceholder={searchPlaceholder}
            emptyText={emptyText}
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-between ${className}`}
        >
          <div className="flex items-center gap-2">
            {selectedItem?.logo && (
              <Image
                src={selectedItem.logo}
                alt={selectedItem.label}
                width={20}
                height={20}
                className="h-5 w-5 object-contain"
              />
            )}
            {selectedItem ? selectedItem.label : placeholder}
          </div>
          <Icons.chevronDown className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <ComboboxList
            items={items}
            onSelect={onSelect}
            setOpen={setOpen}
            searchPlaceholder={searchPlaceholder}
            emptyText={emptyText}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

interface ComboboxListProps {
  items: ComboboxItem[]
  onSelect: (item: ComboboxItem | null) => void
  setOpen: (open: boolean) => void
  searchPlaceholder: string
  emptyText: string
}

function ComboboxList({
  items,
  onSelect,
  setOpen,
  searchPlaceholder,
  emptyText,
}: ComboboxListProps) {
  const [search, setSearch] = React.useState("")
  
  const filteredItems = React.useMemo(() => {
    if (!search) return items
    return items.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    )
  }, [items, search])

  return (
    <Command shouldFilter={false}>
      <CommandInput 
        placeholder={searchPlaceholder} 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>{emptyText}</CommandEmpty>
        <CommandGroup>
          {filteredItems.map((item) => (
            <CommandItem
              key={item.value}
              value={item.value}
              onSelect={(value) => {
                onSelect(items.find((item) => item.value === value) || null)
                setOpen(false)
              }}
            >
              <div className="flex items-center gap-2">
                {item.logo && (
                  <Image
                    src={item.logo}
                    alt={item.label}
                    width={20}
                    height={20}
                    className="h-5 w-5 object-contain"
                  />
                )}
                {item.label}
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
} 