export function formatDate(date: Date | null): string {
  if (!date) return "Never"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function getRelativeTime(date: Date | null): string {
  if (!date) return "Never"

  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return "Today"
  if (diffInDays === 1) return "Yesterday"
  if (diffInDays < 7) return `${diffInDays}d ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`
  return `${Math.floor(diffInDays / 365)}y ago`
}

export function getPrimaryDate(lastViewed: Date | null, createdAt: Date) {
  if (lastViewed) {
    return {
      relative: getRelativeTime(lastViewed),
      absolute: formatDate(lastViewed),
      label: "Last viewed",
    }
  }
  return {
    relative: getRelativeTime(createdAt),
    absolute: formatDate(createdAt),
    label: "Created",
  }
}

export function getFullFormattedDateAndTime(date: Date | null): string {
  if (!date) return "Never"
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date)
}
