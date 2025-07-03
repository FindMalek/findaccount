import { useMemo, useState } from "react"
import type { CredentialEntitySimpleDbData } from "@/entities"

export function useEntityFilters(entities: CredentialEntitySimpleDbData[]) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")

  const platforms = useMemo(() => {
    const uniquePlatforms = new Set(entities.map((entity) => entity.platformId))
    return Array.from(uniquePlatforms).sort()
  }, [entities])

  const filteredEntities = useMemo(() => {
    return entities.filter((entity) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        entity.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entity.description &&
          entity.description.toLowerCase().includes(searchTerm.toLowerCase()))

      // Status filter
      const matchesStatus =
        statusFilter === "all" || entity.status === statusFilter

      // Platform filter
      const matchesPlatform =
        platformFilter === "all" || entity.platformId === platformFilter

      return matchesSearch && matchesStatus && matchesPlatform
    })
  }, [entities, searchTerm, statusFilter, platformFilter])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPlatformFilter("all")
  }

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    platformFilter,
    setPlatformFilter,
    platforms,
    filteredEntities,
    clearFilters,
  }
}
