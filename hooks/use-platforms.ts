import { useEffect, useState } from "react"
import { PlatformSimpleRo } from "@/schemas/platform"

import { listPlatforms } from "@/actions/platform"

export function usePlatforms() {
  const [platforms, setPlatforms] = useState<PlatformSimpleRo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const result = await listPlatforms(1, 100)
        if (result.success && result.platforms) {
          setPlatforms(result.platforms)
        } else {
          setError(result.error || "Failed to fetch platforms")
        }
      } catch (err) {
        setError("An error occurred while fetching platforms")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlatforms()
  }, [])

  return { platforms, isLoading, error }
}
