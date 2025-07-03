import { useMemo, useState } from "react"
import type { CredentialEntitySimpleDbData } from "@/entities"
import type { SortDirection, SortField } from "@/schemas"

export function useEntitySorting(entities: CredentialEntitySimpleDbData[]) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortField(null)
        setSortDirection(null)
      } else {
        setSortDirection("asc")
      }
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedEntities = useMemo(() => {
    if (!sortField || !sortDirection) return entities

    return [...entities].sort((a, b) => {
      let aValue: string | number | Date | null = a[sortField]
      let bValue: string | number | Date | null = b[sortField]

      if (sortField === "lastViewed" || sortField === "createdAt") {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      } else if (aValue === null || aValue === undefined) {
        aValue = ""
      }

      if (bValue === null || bValue === undefined) {
        bValue = ""
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }, [entities, sortField, sortDirection])

  return {
    sortField,
    sortDirection,
    handleSort,
    sortedEntities,
  }
}
