"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"

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

// Array of softer pastel colors in HEX format
const softColors = [
  "#F8E8EE", // soft rose
  "#E8F4F8", // soft sky
  "#E8F8F0", // soft mint
  "#F8F8E8", // soft cream
  "#F0E8F8", // soft lavender
  "#F8E8F8", // soft pink
  "#E8E8F8", // soft periwinkle
  "#F8F0E8", // soft peach
  "#E8F8F8", // soft aqua
  "#F0F8E8", // soft sage
  "#F8F0F0", // soft blush
  "#E8F8E8", // soft seafoam
  "#F0F0F8", // soft bluebell
  "#F8E8F0", // soft mauve
  "#F8F8F0", // soft butter
  "#E8F0F8", // soft powder
  "#F0F8F0", // soft jade
]

// Function to get a random color from the array
export const getRandomSoftColor = () => {
  return softColors[Math.floor(Math.random() * softColors.length)]
}

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
          [tagId]: getRandomSoftColor(),
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
      [tagId]: getRandomSoftColor(),
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
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
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
                        "mr-2 h-4 w-4",
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
                      <Check className="mr-2 h-4 w-4 opacity-100" />
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
                [tagId]: getRandomSoftColor(),
              }))
            }
            const backgroundColor = colorMap[tagId] || getRandomSoftColor()

            return (
              <Badge
                key={tagId}
                variant="outline"
                className="flex items-center gap-1"
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
