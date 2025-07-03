"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { generateTagColor } from "@/lib/utils/color-helpers"

import { Badge } from "@/components/ui/badge"
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

interface TagSelectorProps<T> {
  availableTags: T[]
  selectedTags: T[]
  onChange: (tags: T[]) => void
  getValue: (tag: T) => string
  getLabel: (tag: T) => string
  createTag: (inputValue: string) => T
  className?: string
}

export function TagSelector<T>({
  availableTags,
  selectedTags,
  onChange,
  getValue,
  getLabel,
  createTag,
  className,
}: TagSelectorProps<T>) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [colorMap, setColorMap] = useState<Record<string, string>>({})

  const filteredTags = availableTags.filter(
    (tag) =>
      getLabel(tag).toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedTags.some((selected) => getValue(selected) === getValue(tag)) &&
      !selectedTags.some(
        (selected) =>
          getLabel(selected).toLowerCase() === getLabel(tag).toLowerCase()
      )
  )

  const handleSelect = (value: string) => {
    const existingTag = availableTags.find((tag) => getValue(tag) === value)
    if (existingTag) {
      // Check if tag with same name already exists
      if (
        selectedTags.some(
          (tag) =>
            getLabel(tag).toLowerCase() === getLabel(existingTag).toLowerCase()
        )
      ) {
        return
      }
      const tagId = getValue(existingTag)
      if (!colorMap[tagId]) {
        setColorMap((prev) => ({
          ...prev,
          [tagId]: generateTagColor(getLabel(existingTag), "pastel"),
        }))
      }
      onChange([...selectedTags, existingTag])
    }
    setInputValue("")
  }

  const handleCreate = () => {
    // Check if tag with same name already exists
    if (
      selectedTags.some(
        (tag) => getLabel(tag).toLowerCase() === inputValue.toLowerCase()
      )
    ) {
      return
    }
    const newTag = createTag(inputValue)
    const tagId = getValue(newTag)
    setColorMap((prev) => ({
      ...prev,
      [tagId]: generateTagColor(inputValue, "pastel"),
    }))
    onChange([...selectedTags, newTag])
    setInputValue("")
  }

  const handleRemove = (value: string) => {
    onChange(selectedTags.filter((tag) => getValue(tag) !== value))
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "hover:bg-accent/50 flex h-9 w-full items-center justify-between",
              className
            )}
          >
            <span className="text-muted-foreground text-sm">
              {selectedTags.length > 0
                ? `${selectedTags.length} tag(s) selected`
                : "Select tags..."}
            </span>
            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Enter tag..."
              value={inputValue}
              onValueChange={(value) => setInputValue(value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && inputValue.trim() !== "") {
                  handleCreate()
                }
              }}
            />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup heading="Tags">
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={getValue(tag)}
                    value={getValue(tag)}
                    onSelect={handleSelect}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        selectedTags.some(
                          (selected) => getValue(selected) === getValue(tag)
                        )
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {getLabel(tag)}
                  </CommandItem>
                ))}
              </CommandGroup>
              {inputValue.trim() !== "" &&
                !availableTags.some(
                  (tag) =>
                    getLabel(tag).toLowerCase() === inputValue.toLowerCase()
                ) && (
                  <CommandGroup heading="Create Tag">
                    <CommandItem value={inputValue} onSelect={handleCreate}>
                      <Check className="mr-2 size-4 opacity-100" />
                      Create &quot;{inputValue}&quot;
                    </CommandItem>
                  </CommandGroup>
                )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Tags display below the input */}
      {selectedTags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => {
            const tagId = getValue(tag)
            // Get or generate a color for this tag
            if (!colorMap[tagId]) {
              setColorMap((prev) => ({
                ...prev,
                [tagId]: generateTagColor(getLabel(tag), "pastel"),
              }))
            }
            const backgroundColor =
              colorMap[tagId] || generateTagColor(getLabel(tag), "pastel")

            return (
              <Badge
                key={tagId}
                variant="outline"
                className="flex items-center gap-1 text-black"
                style={{ backgroundColor }}
              >
                {getLabel(tag)}
                <button
                  type="button"
                  className="hover:bg-destructive/20 cursor-pointer rounded-full p-0.5 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(getValue(tag))
                  }}
                >
                  <X size={12} className="text-muted-foreground" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
