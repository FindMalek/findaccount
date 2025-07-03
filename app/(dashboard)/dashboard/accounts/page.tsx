import { Metadata } from "next"
import { createServerClient } from "@/orpc/client/server"
import { createContext } from "@/orpc/context"

import { DashboardCredentialsClient } from "@/components/app/dashboard-credential-client"

export const metadata: Metadata = {
  title: "Accounts",
  description: "Manage your accounts and credentials",
}

async function getInitialData() {
  const context = await createContext()
  const serverClient = createServerClient(context)

  try {
    const [credentialsResponse, platformsResponse] = await Promise.all([
      serverClient.credentials.list({
        page: 1,
        limit: 50,
      }),
      serverClient.platforms.list({
        page: 1,
        limit: 100,
      }),
    ])

    return {
      credentials: credentialsResponse,
      platforms: platformsResponse,
    }
  } catch (error) {
    console.error("Failed to fetch initial data:", error)
    return {
      credentials: {
        credentials: [],
        total: 0,
        hasMore: false,
        page: 1,
        limit: 50,
      },
      platforms: {
        platforms: [],
        total: 0,
        hasMore: false,
        page: 1,
        limit: 100,
      },
    }
  }
}

export default async function AccountsPage() {
  const initialData = await getInitialData()

  return <DashboardCredentialsClient initialData={initialData} />
}
