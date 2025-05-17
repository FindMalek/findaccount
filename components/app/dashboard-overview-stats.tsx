import * as React from "react"

import { StatsCard } from "@/components/app/dashboard-overview-stats-card"
import { Icons } from "@/components/shared/icons"

// import { listCards } from "@/actions/card"
// import { listSecrets } from "@/actions/secret"
// import { listUsers } from "@/actions/user"

// async function getStats() {
//   const [usersData, cardsData, secretsData] = await Promise.all([
//     listUsers(1, 1), // We only need the total, so limit to 1
//     listCards(1, 1),
//     listSecrets(1, 1),
//   ])

//   return {
//     accounts: usersData.total ?? 0,
//     cards: cardsData.total ?? 0,
//     secrets: secretsData.total ?? 0,
//   }
// }

interface OverviewStatsProps {
  stats: {
    credentials: number
    cards: number
    secrets: number
  }
}

export async function OverviewStats({ stats }: OverviewStatsProps) {
  // const stats = await getStats()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Total Accounts"
        value={stats.credentials}
        icon={
          <Icons.user className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
        }
        description="Total number of accounts"
      />
      <StatsCard
        title="Total Payment Cards"
        value={stats.cards}
        icon={
          <Icons.creditCard className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
        }
        description="Total number of payment cards"
      />
      <StatsCard
        title="Total Secure Notes"
        value={stats.secrets}
        icon={
          <Icons.key className="text-muted-foreground group-hover:text-primary h-4 w-4 transition-colors" />
        }
        description="Total number of secure notes"
      />
    </div>
  )
}
