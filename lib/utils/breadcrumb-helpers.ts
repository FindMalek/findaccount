// Helper function to check if we're on an individual resource page
export const isIndividualResourcePage = (
  pathSegments: string[],
  index: number
): boolean => {
  // Check if this is the last segment and there's a resource type before it
  const isLast = index === pathSegments.length - 1
  const hasResourceTypeBefore =
    index > 0 && getResourceType(pathSegments[index - 1]) !== null

  return isLast && hasResourceTypeBefore
}

// Helper function to get resource type from segment
export const getResourceType = (
  segment: string
): "accounts" | "cards" | "secrets" | null => {
  switch (segment) {
    case "accounts":
      return "accounts"
    case "cards":
      return "cards"
    case "secrets":
      return "secrets"
    default:
      return null
  }
}

// Type for resource types
export type ResourceType = "accounts" | "cards" | "secrets"
