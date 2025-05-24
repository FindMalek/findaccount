"use client"

import { useEffect, useState } from "react"
import { TagDto } from "@/schemas/tag"

import { listTags } from "@/actions/tag"

export function useTags(containerId?: string) {
  const [tags, setTags] = useState<TagDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await listTags(containerId)

        if (result.success && result.tags) {
          const tagDtos = result.tags.map((tag) => ({
            name: tag.name,
            color: tag.color || undefined,
            userId: tag.userId || undefined,
            containerId: tag.containerId || undefined,
          }))
          setTags(tagDtos)
        } else {
          setError(result.error || "Failed to fetch tags")
        }
      } catch (err) {
        setError("An unexpected error occurred")
        console.error("Error fetching tags:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTags()
  }, [containerId])

  return {
    tags,
    error,
    isLoading,
  }
}
