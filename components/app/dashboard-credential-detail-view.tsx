"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  useCredential,
  useUpdateCredential,
} from "@/orpc/hooks/use-credentials"
import {
  credentialFormDtoSchema,
  type CredentialFormDto,
} from "@/schemas/credential/credential"
import type {
  CredentialOutput,
  UpdateCredentialInput,
} from "@/schemas/credential/dto"
import type { ListPlatformsOutput } from "@/schemas/utils/dto"
import { zodResolver } from "@hookform/resolvers/zod"
import { AccountStatus } from "@prisma/client"
import { useForm } from "react-hook-form"

import { handleErrors } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { DashboardCredentialDetailSkeleton } from "@/components/app/dashboard-credential-detail-skeleton"
import { CredentialFooter } from "@/components/app/dashboard-credential-footer"
import { CredentialForm } from "@/components/app/dashboard-credential-form"
import { CredentialHeader } from "@/components/app/dashboard-credential-header"
import { CredentialSidebar } from "@/components/app/dashboard-credential-sidebar"
import { EmptyState } from "@/components/shared/empty-state"
import { FloatingSaveToolbar } from "@/components/shared/floating-save-toolbar"
import { Icons } from "@/components/shared/icons"
import { Separator } from "@/components/ui/separator"

interface CredentialDetailViewProps {
  credentialId: string
  initialData?: {
    credential: CredentialOutput
    platforms: ListPlatformsOutput
  }
}

export function CredentialDetailView({
  credentialId,
  initialData,
}: CredentialDetailViewProps) {
  const router = useRouter()
  const { toast } = useToast()

  const {
    data: credential,
    isLoading,
    error,
  } = useCredential(credentialId, {
    initialData: initialData?.credential,
  })
  const updateCredentialMutation = useUpdateCredential()

  const platform = initialData?.platforms.platforms.find(
    (p) => p.id === credential?.platformId
  )
  if (!platform) {
    throw new Error("Platform not found")
  }

  // Form setup with react-hook-form and zod
  const form = useForm<CredentialFormDto>({
    resolver: zodResolver(credentialFormDtoSchema),
    defaultValues: {
      identifier: "",
      description: "",
      status: "ACTIVE",
      platformId: "",
      containerId: "",
      passwordProtection: true,
      twoFactorAuth: false,
      accessLogging: true,
    },
  })

  const {
    formState: { isDirty },
    reset,
    handleSubmit,
  } = form

  // Initialize form when credential loads
  useEffect(() => {
    if (credential) {
      const initialFormData: CredentialFormDto = {
        identifier: credential.identifier,
        description: credential.description || "",
        status: credential.status,
        platformId: credential.platformId,
        containerId: credential.containerId || "",
        // TODO: Get these from credential metadata when available/app/dashboard-credential-detail-view.tsx
        passwordProtection: true,
        twoFactorAuth: false,
        accessLogging: true,
      }
      reset(initialFormData)
    }
  }, [credential, reset])

  const handleSave = async (data: CredentialFormDto) => {
    if (!credential) return

    try {
      const updateData: UpdateCredentialInput = {
        id: credential.id,
        identifier: data.identifier,
        description: data.description || undefined,
        status: data.status,
        platformId: data.platformId,
        containerId: data.containerId || undefined,
        // TODO: Handle metadata fields (passwordProtection, twoFactorAuth, accessLogging)
      }

      await updateCredentialMutation.mutateAsync(updateData)

      // Reset form dirty state after successful save
      reset(data)
      toast("Credential updated successfully", "success")
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to save credential"
      )
      toast(
        details
          ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
          : message,
        "error"
      )
    }
  }

  const handleDiscard = () => {
    if (credential) {
      const originalData: CredentialFormDto = {
        identifier: credential.identifier,
        description: credential.description || "",
        status: credential.status,
        platformId: credential.platformId,
        containerId: credential.containerId || "",
        passwordProtection: true,
        twoFactorAuth: false,
        accessLogging: true,
      }
      reset(originalData)
    }
  }

  const handleDelete = async () => {
    if (!credential) return

    // TODO: Implement delete logic
    console.log("Deleting credential:", credential.id)
    router.push("/dashboard/credentials")
  }

  const handleContainerChange = (containerId: string) => {
    form.setValue("containerId", containerId, { shouldDirty: true })
  }

  const handleStatusChange = async (status: AccountStatus) => {
    if (!credential) return

    try {
      const updateData: UpdateCredentialInput = {
        id: credential.id,
        status: status,
      }

      await updateCredentialMutation.mutateAsync(updateData)
      toast("Status updated successfully", "success")
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to update status"
      )
      toast(
        details
          ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
          : message,
        "error"
      )
    }
  }

  if (isLoading) {
    return <DashboardCredentialDetailSkeleton />
  }

  if (error || !credential) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <EmptyState
          icon={() => <Icons.warning className="size-12" />}
          title="Credential not found"
          description="The credential you're looking for doesn't exist or you don't have access to it."
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl p-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-3">
            <CredentialHeader
              credential={credential}
              platform={platform}
              onDelete={handleDelete}
            />
            <Separator />
            <CredentialForm credential={credential} form={form} />
            <CredentialFooter credential={credential} />
          </div>

          <CredentialSidebar
            credential={{
              ...credential,
              containerId: form.watch("containerId") || credential.containerId,
            }}
            onStatusChange={handleStatusChange}
            onContainerChange={handleContainerChange}
          />
        </div>
      </div>

      <FloatingSaveToolbar
        isVisible={isDirty}
        onSave={handleSubmit(handleSave)}
        onDiscard={handleDiscard}
      />
    </div>
  )
}
