import { Icons } from "@/components/shared/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon = Icons.grid,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="py-12 text-center">
        <div className="text-muted-foreground mb-4">
          <Icon className="mx-auto size-12" />
        </div>
        <h3 className="text-muted-foreground mb-2 text-lg font-medium">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        {actionLabel && onAction && (
          <Button variant="outline" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
