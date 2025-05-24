import { cn } from "@/lib/utils"

interface PasswordStrengthMeterProps {
  score: number
  className?: string
}

export function PasswordStrengthMeter({
  score,
  className,
}: PasswordStrengthMeterProps) {
  const levels = 4
  const colors = [
    "rgb(239, 68, 68)", // red-500
    "rgb(249, 115, 22)", // orange-500
    "rgb(234, 179, 8)", // yellow-500
    "rgb(34, 197, 94)", // green-500
  ]

  return (
    <div className={cn("flex gap-1", className)}>
      {[...Array(levels)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 flex-1 rounded-full transition-all",
            i < score ? "bg-current" : "bg-muted"
          )}
          style={{
            color: i < score ? colors[score - 1] : undefined,
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}
