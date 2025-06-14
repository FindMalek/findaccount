"use client"

import { useEffect, useState } from "react"
import {
  CredentialDto,
  credentialDtoSchema,
  CredentialMetadataDto,
  credentialMetadataDtoSchema,
} from "@/schemas/credential"
import { zodResolver } from "@hookform/resolvers/zod"
import { AccountStatus } from "@prisma/client"
import { useForm } from "react-hook-form"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { checkPasswordStrength, generatePassword } from "@/lib/password"
import { cn, getMetadataLabels, handleErrors } from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { usePlatforms } from "@/hooks/use-platforms"
import { useTags } from "@/hooks/use-tags"
import { useToast } from "@/hooks/use-toast"

import { DashboardAddCredentialForm } from "@/components/app/dashboard-add-credential-form"
import { DashboardAddCredentialMetadataForm } from "@/components/app/dashboard-add-credential-metadata-form"
import { AddItemDialog } from "@/components/shared/add-item-dialog"
import { Icons } from "@/components/shared/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Form } from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"

import { createCredentialWithMetadata } from "@/actions/credential"

interface CredentialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardAddCredentialDialog({
  open,
  onOpenChange,
}: CredentialDialogProps) {
  const { toast } = useToast()
  const { platforms, error: platformsError } = usePlatforms()
  const { tags: availableTags, error: tagsError } = useTags()

  const [createMore, setCreateMore] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    feedback: string
  } | null>(null)

  const [sensitiveData, setSensitiveData] = useState({
    identifier: "",
    password: "",
  })

  const { copy, isCopied } = useCopyToClipboard({
    successDuration: 1500,
  })

  const credentialForm = useForm<CredentialDto>({
    resolver: zodResolver(credentialDtoSchema),
    defaultValues: {
      identifier: "",
      description: "",
      status: AccountStatus.ACTIVE,
      platformId: "",
      containerId: "",
      passwordEncryption: {
        encryptedValue: "",
        iv: "",
        encryptionKey: "",
      },
      tags: [],
      metadata: [],
    },
  })

  const metadataForm = useForm<CredentialMetadataDto>({
    resolver: zodResolver(credentialMetadataDtoSchema),
    defaultValues: {
      recoveryEmail: "",
      phoneNumber: "",
      otherInfo: [],
      has2FA: false,
      credentialId: "",
    },
  })

  useEffect(() => {
    if (platformsError) {
      toast(platformsError, "error")
    }
    if (tagsError) {
      toast(tagsError, "error")
    }
  }, [platformsError, tagsError, toast])

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(16)
    setSensitiveData((prev) => ({ ...prev, password: newPassword }))
    setPasswordStrength(checkPasswordStrength(newPassword))
  }

  const handlePasswordChange = (password: string) => {
    setSensitiveData((prev) => ({ ...prev, password }))
    setPasswordStrength(checkPasswordStrength(password))
  }

  const handleCopyPassword = () => {
    copy(sensitiveData.password)
  }

  const hasMetadataValues = () => {
    const values = metadataForm.getValues()
    return (
      values.recoveryEmail?.trim() ||
      values.phoneNumber?.trim() ||
      (values.otherInfo && values.otherInfo.length > 0) ||
      values.has2FA
    )
  }

  const getMetadataLabelsForCredential = () => {
    const values = metadataForm.getValues()
    const fieldMappings = {
      recoveryEmail: "Email",
      phoneNumber: "Phone",
      has2FA: "2FA",
      otherInfo: "Notes",
    }
    return getMetadataLabels(values, fieldMappings, 4)
  }

  async function onSubmit() {
    try {
      setIsSubmitting(true)

      if (!sensitiveData.identifier.trim()) {
        toast("Identifier is required", "error")
        return
      }

      if (!sensitiveData.password.trim()) {
        toast("Password is required", "error")
        return
      }

      const key = await generateEncryptionKey()
      const encryptResult = await encryptData(sensitiveData.password, key)
      const keyString = await exportKey(key as CryptoKey)

      credentialForm.setValue("identifier", sensitiveData.identifier)
      credentialForm.setValue("passwordEncryption", {
        encryptedValue: encryptResult.encryptedData,
        iv: encryptResult.iv,
        encryptionKey: keyString,
      })

      const credentialValid = await credentialForm.trigger()
      if (!credentialValid) {
        toast("Please fill in all required credential fields", "error")
        return
      }

      if (hasMetadataValues()) {
        const metadataValid = await metadataForm.trigger()
        if (!metadataValid) {
          toast("Please check the additional information fields", "error")
          return
        }
      }

      const credentialData = credentialForm.getValues()

      const credentialDto: CredentialDto = {
        identifier: sensitiveData.identifier,
        passwordEncryption: {
          encryptedValue: encryptResult.encryptedData,
          iv: encryptResult.iv,
          encryptionKey: keyString,
        },
        status: credentialData.status,
        tags: credentialData.tags,
        metadata: credentialData.metadata,
        description: credentialData.description,
        platformId: credentialData.platformId,
        containerId: credentialData.containerId,
      }

      let metadataDto: Omit<CredentialMetadataDto, "credentialId"> | undefined

      if (hasMetadataValues()) {
        const metadataValues = metadataForm.getValues()
        metadataDto = {
          has2FA: metadataValues.has2FA,
        }

        if (metadataValues.recoveryEmail?.trim()) {
          metadataDto.recoveryEmail = metadataValues.recoveryEmail
        }
        if (metadataValues.phoneNumber?.trim()) {
          metadataDto.phoneNumber = metadataValues.phoneNumber
        }
        if (metadataValues.otherInfo && metadataValues.otherInfo.length > 0) {
          metadataDto.otherInfo = metadataValues.otherInfo
        }
      }

      const result = await createCredentialWithMetadata(
        credentialDto,
        metadataDto
      )

      if (result.success) {
        toast("Credential saved successfully", "success")

        if (!createMore) {
          handleDialogOpenChange(false)
        } else {
          credentialForm.reset({
            identifier: "",
            description: "",
            status: AccountStatus.ACTIVE,
            platformId: credentialData.platformId,
            containerId: credentialData.containerId,
            passwordEncryption: {
              encryptedValue: "",
              iv: "",
              encryptionKey: "",
            },
            tags: [],
            metadata: [],
          })
          metadataForm.reset({
            recoveryEmail: "",
            phoneNumber: "",
            otherInfo: [],
            has2FA: false,
          })
          setSensitiveData({ identifier: "", password: "" })
          setPasswordStrength(null)
          setShowMetadata(false)
        }
      } else {
        const errorDetails = result.issues
          ? result.issues
              .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
              .join(", ")
          : result.error

        toast(
          `Failed to save credential: ${errorDetails || "Unknown error"}`,
          "error"
        )
      }
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      credentialForm.reset()
      metadataForm.reset()
      setSensitiveData({ identifier: "", password: "" })
      setCreateMore(false)
      setShowMetadata(false)
      setPasswordStrength(null)
    }
    onOpenChange(open)
  }

  return (
    <AddItemDialog
      open={open}
      onOpenChange={handleDialogOpenChange}
      title="Add New Credential"
      description="Add a new credential to your vault. All information is securely stored."
      icon={<Icons.user className="size-5" />}
      isSubmitting={isSubmitting}
      createMore={createMore}
      onCreateMoreChange={setCreateMore}
      createMoreText="Create another credential"
      submitText="Save Credential"
      formId="credential-form"
      className="sm:max-w-[800px]"
    >
      <Form {...credentialForm}>
        <form
          id="credential-form"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="space-y-6"
        >
          <DashboardAddCredentialForm
            form={credentialForm}
            platforms={platforms}
            availableTags={availableTags}
            passwordStrength={passwordStrength}
            sensitiveData={sensitiveData}
            setSensitiveData={setSensitiveData}
            onPasswordChange={handlePasswordChange}
            onGeneratePassword={handleGeneratePassword}
            onCopyPassword={handleCopyPassword}
            isCopied={isCopied}
          />

          <div className="space-y-4">
            <Separator />

            <Collapsible open={showMetadata} onOpenChange={setShowMetadata}>
              <CollapsibleTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "hover:bg-muted/50 flex w-full items-center justify-between p-4",
                    showMetadata && "bg-muted/55"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Icons.add className="h-4 w-4" />
                      <span className="font-medium">
                        Additional Information
                      </span>
                    </div>
                    {hasMetadataValues() && (
                      <Badge variant="secondary" className="text-xs">
                        {getMetadataLabelsForCredential()}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {showMetadata ? "Hide" : "Optional"}
                    </span>
                    <Icons.chevronDown
                      className={`h-4 w-4 transition-transform ${
                        showMetadata ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-4">
                <div className="bg-muted/55 p-4">
                  <Form {...metadataForm}>
                    <DashboardAddCredentialMetadataForm form={metadataForm} />
                  </Form>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </form>
      </Form>
    </AddItemDialog>
  )
}
