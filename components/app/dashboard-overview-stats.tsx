import * as React from "react"

import { StatsCard } from "@/components/app/dashboard-overview-stats-card"
import { Icons } from "@/components/shared/icons"

interface OverviewStatsProps {
  stats: {
    credentials: number
    cards: number
    secrets: number
  }
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Total Accounts"
        value={stats.credentials}
        icon={
          <Icons.user className="text-muted-foreground group-hover:text-primary size-4 transition-colors" />
        }
        description="Total number of accounts"
      />
      <StatsCard
        title="Total Payment Cards"
        value={stats.cards}
        icon={
          <Icons.creditCard className="text-muted-foreground group-hover:text-primary size-4 transition-colors" />
        }
        description="Total number of payment cards"
      />
      <StatsCard
        title="Total Secure Notes"
        value={stats.secrets}
        icon={
          <Icons.key className="text-muted-foreground group-hover:text-primary size-4 transition-colors" />
        }
        description="Total number of secure notes"
      />
    </div>
  )
}
