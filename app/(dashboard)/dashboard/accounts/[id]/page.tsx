import { Suspense } from "react"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerClient } from "@/orpc/client/server"
import { createContext } from "@/orpc/context"

import { DashboardCredentialDetailSkeleton } from "@/components/app/dashboard-credential-detail-skeleton"
import { CredentialDetailView } from "@/components/app/dashboard-credential-detail-view"

interface CredentialDetailPageProps {
  params: Promise<{
    id: string
  }>
}

async function getCredentialData(id: string) {
  try {
    const context = await createContext()
    const serverClient = createServerClient(context)

    const [credential, platforms] = await Promise.all([
      serverClient.credentials.get({ id }),
      serverClient.platforms.list({
        page: 1,
        limit: 100,
      }),
    ])

    return {
      credential,
      platforms,
    }
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: CredentialDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params

  if (!resolvedParams.id) {
    return {
      title: "Credential Not Found",
      description: "The requested credential could not be found.",
    }
  }

  const data = await getCredentialData(resolvedParams.id)

  if (!data) {
    return {
      title: "Credential Not Found",
      description: "The requested credential could not be found.",
    }
  }

  const { credential, platforms } = data
  const platform = platforms.platforms.find(
    (p) => p.id === credential.platformId
  )
  const platformName = platform?.name || "Unknown Platform"

  return {
    title: `${credential.identifier} - ${platformName}`,
    description: credential.description
      ? `Credential details for ${credential.identifier} on ${platformName}. ${credential.description}`
      : `Credential details for ${credential.identifier} on ${platformName}.`,
    openGraph: {
      title: `${credential.identifier} - ${platformName}`,
      description: credential.description
        ? `Credential details for ${credential.identifier} on ${platformName}. ${credential.description}`
        : `Credential details for ${credential.identifier} on ${platformName}.`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${credential.identifier} - ${platformName}`,
      description: credential.description
        ? `Credential details for ${credential.identifier} on ${platformName}. ${credential.description}`
        : `Credential details for ${credential.identifier} on ${platformName}.`,
    },
  }
}

export default async function CredentialDetailPage({
  params,
}: CredentialDetailPageProps) {
  const resolvedParams = await params

  if (!resolvedParams.id) {
    notFound()
  }

  const data = await getCredentialData(resolvedParams.id)

  if (!data) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<DashboardCredentialDetailSkeleton />}>
        <CredentialDetailView
          credentialId={resolvedParams.id}
          initialData={data}
        />
      </Suspense>
    </div>
  )
}
