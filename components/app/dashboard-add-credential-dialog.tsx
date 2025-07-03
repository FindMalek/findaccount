"use client"

import { useState } from "react"
import Image from "next/image"
import {
  useCreateCredentialWithMetadata,
  usePlatforms,
  useTags,
} from "@/orpc/hooks"
import {
  accountStatusEnum,
  AccountStatusInfer,
  CredentialDto,
  credentialDtoSchema,
  CredentialMetadataDto,
  credentialMetadataDtoSchema,
} from "@/schemas/credential"
import { CredentialKeyValuePairDto } from "@/schemas/credential/credential-key-value"
import { GenericEncryptedKeyValuePairDto } from "@/schemas/encryption/encryption"
import { EntityTypeEnum } from "@/schemas/utils"
import { TagDto } from "@/schemas/utils/tag"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { statusConfig } from "@/config/converter"
import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import {
  cn,
  getLogoDevUrlWithToken,
  getPlaceholderImage,
  handleErrors,
} from "@/lib/utils"
import {
  checkPasswordStrength,
  generatePassword,
} from "@/lib/utils/password-helpers"
import { useToast } from "@/hooks/use-toast"

import { ContainerSelector } from "@/components/shared/container-selector"
import { EncryptedKeyValueForm } from "@/components/shared/encrypted-key-value-form"
import { Icons } from "@/components/shared/icons"
import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter"
import { StatusBadge } from "@/components/shared/status-badge"
import { TagSelector } from "@/components/shared/tag-selector"
import { Button } from "@/components/ui/button"
import { ComboboxResponsive } from "@/components/ui/combobox-responsive"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const convertGenericToCredential = (
  generic: GenericEncryptedKeyValuePairDto[]
): CredentialKeyValuePairDto[] => {
  return generic.map((item) => ({
    ...item,
    credentialMetadataId: undefined,
  }))
}

const convertCredentialToGeneric = (
  credential: CredentialKeyValuePairDto[]
): GenericEncryptedKeyValuePairDto[] => {
  return credential.map((item) => ({
    id: item.id,
    key: item.key,
    valueEncryption: item.valueEncryption,
  }))
}

interface CredentialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardAddCredentialDialog({
  open,
  onOpenChange,
}: CredentialDialogProps) {
  const { toast } = useToast()

  const { data: platformsData } = usePlatforms()
  const { data: tagsData } = useTags({ page: 1, limit: 100 })

  const platforms = platformsData?.platforms || []
  const availableTags = tagsData?.tags || []

  const createCredentialWithMetadataMutation = useCreateCredentialWithMetadata()

  const [sensitiveData, setSensitiveData] = useState({
    identifier: "",
    password: "",
  })
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    feedback: string
  } | null>(null)
  const [createMore, setCreateMore] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Forms
  const credentialForm = useForm<CredentialDto>({
    resolver: zodResolver(credentialDtoSchema),
    defaultValues: {
      identifier: "",
      description: "",
      status: accountStatusEnum.ACTIVE,
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
      keyValuePairs: [],
      has2FA: false,
    },
  })

  const selectedPlatform = platforms.find(
    (p) => p.id === credentialForm.watch("platformId")
  )

  // Password handling
  const handleGeneratePassword = () => {
    setIsGenerating(true)
    const newPassword = generatePassword()
    setSensitiveData((prev) => ({ ...prev, password: newPassword }))
    setPasswordStrength(checkPasswordStrength(newPassword))

    // Reset animation after 300ms
    setTimeout(() => setIsGenerating(false), 300)
  }

  const handlePasswordChange = (password: string) => {
    setSensitiveData((prev) => ({ ...prev, password }))
    setPasswordStrength(checkPasswordStrength(password))
  }

  const handleStatusChange = (newStatus: AccountStatusInfer) => {
    credentialForm.setValue("status", newStatus)
    setStatusPopoverOpen(false)
  }

  // Check if metadata has values
  const hasMetadataValues = () => {
    const values = metadataForm.getValues()
    return (
      values.recoveryEmail?.trim() ||
      values.phoneNumber?.trim() ||
      (values.keyValuePairs && values.keyValuePairs.length > 0) ||
      values.has2FA
    )
  }

  // Submit handler
  async function onSubmit() {
    if (!sensitiveData.identifier.trim()) {
      toast("Identifier is required", "error")
      return
    }

    if (!sensitiveData.password.trim()) {
      toast("Password is required", "error")
      return
    }

    try {
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

      let metadataDto: CredentialMetadataDto | undefined

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

        if (
          metadataValues.keyValuePairs &&
          metadataValues.keyValuePairs.length > 0
        ) {
          metadataDto.keyValuePairs = metadataValues.keyValuePairs
        }
      }

      createCredentialWithMetadataMutation.mutate(
        {
          credential: credentialDto,
          metadata: metadataDto,
        },
        {
          onSuccess: () => {
            toast("Credential created successfully", "success")

            if (!createMore) {
              handleDialogOpenChange(false)
            } else {
              // Reset for creating another
              credentialForm.reset({
                identifier: "",
                description: "",
                status: accountStatusEnum.ACTIVE,
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
                keyValuePairs: [],
                has2FA: false,
              })
              setSensitiveData({ identifier: "", password: "" })
              setPasswordStrength(null)
              setShowAdvanced(false)
            }
          },
          onError: (error) => {
            const { message, details } = handleErrors(
              error,
              "Failed to create credential"
            )
            toast(
              details
                ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
                : message,
              "error"
            )
          },
        }
      )
    } catch (error) {
      const { message, details } = handleErrors(
        error,
        "Failed to encrypt credential data"
      )
      toast(
        details
          ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
          : message,
        "error"
      )
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      credentialForm.reset()
      metadataForm.reset()
      setSensitiveData({ identifier: "", password: "" })
      setCreateMore(false)
      setShowAdvanced(false)
      setPasswordStrength(null)
      setIsGenerating(false)
    }
    onOpenChange(open)
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={handleDialogOpenChange}>
      <ResponsiveDialogContent className="max-h-[90vh] sm:max-w-[900px]">
        <ResponsiveDialogHeader className="border-b pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {selectedPlatform && (
                <div className="flex-shrink-0">
                  <Image
                    src={getPlaceholderImage(
                      selectedPlatform.name,
                      getLogoDevUrlWithToken(selectedPlatform.logo)
                    )}
                    alt={`${selectedPlatform.name} logo`}
                    width={48}
                    height={48}
                    className="bg-muted ring-border size-12 rounded-lg object-contain p-2 ring-1"
                  />
                </div>
              )}

              <div className="min-w-0 flex-1 space-y-1">
                <ResponsiveDialogTitle className="flex items-center gap-2 font-mono">
                  {!selectedPlatform && <Icons.user className="size-3" />}
                  Add New Credential
                </ResponsiveDialogTitle>
                <ResponsiveDialogDescription>
                  {selectedPlatform
                    ? `Create a new credential for ${selectedPlatform.name}`
                    : "Add a new credential to your vault. All information is securely stored."}
                </ResponsiveDialogDescription>
              </div>
            </div>
          </div>
        </ResponsiveDialogHeader>

        <ResponsiveDialogBody className="max-h-[60vh] space-y-6 overflow-y-auto">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Main Form */}
            <div className="space-y-6 lg:col-span-3">
              <Form {...credentialForm}>
                <form id="credential-form" className="space-y-6">
                  {/* Platform Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="platform" className="text-sm font-medium">
                        Platform
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Icons.helpCircle className="text-muted-foreground size-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Required field - Select the platform for this
                            credential
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <ComboboxResponsive
                      items={platforms.map((platform) => ({
                        value: platform.id,
                        label: platform.name,
                        logo: getPlaceholderImage(
                          platform.name,
                          getLogoDevUrlWithToken(platform.logo || null)
                        ),
                      }))}
                      selectedItem={
                        platforms.find(
                          (p) => p.id === credentialForm.watch("platformId")
                        )
                          ? {
                              value: credentialForm.watch("platformId"),
                              label:
                                platforms.find(
                                  (p) =>
                                    p.id === credentialForm.watch("platformId")
                                )?.name || "",
                              logo: getPlaceholderImage(
                                platforms.find(
                                  (p) =>
                                    p.id === credentialForm.watch("platformId")
                                )?.name || "",
                                getLogoDevUrlWithToken(
                                  platforms.find(
                                    (p) =>
                                      p.id ===
                                      credentialForm.watch("platformId")
                                  )?.logo || null
                                )
                              ),
                            }
                          : null
                      }
                      onSelect={(item) =>
                        credentialForm.setValue("platformId", item?.value || "")
                      }
                      placeholder="Select a platform..."
                      searchPlaceholder="Search platforms..."
                      emptyText="No platforms found."
                    />
                  </div>

                  {/* Basic Credential Info */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="identifier"
                          className="text-sm font-medium"
                        >
                          Username/Email
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Icons.helpCircle className="text-muted-foreground size-3" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Required field - Enter the username or email for
                              this account
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="identifier"
                        value={sensitiveData.identifier}
                        onChange={(e) =>
                          setSensitiveData((prev) => ({
                            ...prev,
                            identifier: e.target.value,
                          }))
                        }
                        placeholder="Enter username or email"
                        className="border-border focus:border-ring focus:ring-ring focus:ring-1"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="password"
                          className="text-sm font-medium"
                        >
                          Password
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Icons.helpCircle className="text-muted-foreground size-3" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Required field - Enter the password for this
                              account
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          variant="password"
                          value={sensitiveData.password}
                          onChange={(e) => handlePasswordChange(e.target.value)}
                          placeholder="Enter password"
                          className="pr-14"
                        />
                        <div className="absolute inset-y-0 right-10 flex items-center gap-1 pr-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleGeneratePassword}
                              >
                                <Icons.refresh
                                  className={`size-3 transition-transform duration-300 ${
                                    isGenerating ? "rotate-180" : ""
                                  }`}
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Generate password</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      {passwordStrength && (
                        <PasswordStrengthMeter score={passwordStrength.score} />
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Icons.helpCircle className="text-muted-foreground size-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add notes or context about this credential</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      {...credentialForm.register("description")}
                      placeholder="Add a description for this credential..."
                      className="border-border focus:border-ring focus:ring-ring min-h-[80px] resize-none focus:ring-1"
                    />
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Tags</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Icons.helpCircle className="text-muted-foreground size-3" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Add tags to organize and categorize this credential
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <TagSelector<TagDto>
                      selectedTags={credentialForm.watch("tags") || []}
                      availableTags={availableTags.map((tag) => ({
                        name: tag.name,
                        containerId: tag.containerId || undefined,
                        color: tag.color || undefined,
                      }))}
                      onChange={(tags: TagDto[]) =>
                        credentialForm.setValue("tags", tags)
                      }
                      getValue={(tag: TagDto) => tag.name}
                      getLabel={(tag: TagDto) => tag.name}
                      createTag={(inputValue: string): TagDto => ({
                        name: inputValue,
                        containerId: undefined,
                        color: undefined,
                      })}
                    />
                  </div>

                  {/* Advanced Settings */}
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      className={cn(
                        "hover:bg-muted/50 flex w-full items-center justify-between p-4",
                        showAdvanced && "bg-muted/55"
                      )}
                      onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                      <div className="flex items-center gap-3">
                        <Icons.settings className="size-3" />
                        <span className="font-medium">Advanced Settings</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">
                          {showAdvanced ? "Hide" : "Optional"}
                        </span>
                        <Icons.chevronDown
                          className={`size-3 transition-transform ${
                            showAdvanced ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </Button>

                    {showAdvanced && (
                      <div className="bg-muted/55 space-y-4 p-4">
                        <Form {...metadataForm}>
                          {/* Two-Factor Authentication */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium">
                                Two-Factor Authentication
                              </Label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Icons.helpCircle className="text-muted-foreground size-3" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    Enable if this account has 2FA configured
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <Switch
                              checked={metadataForm.watch("has2FA")}
                              onCheckedChange={(checked) =>
                                metadataForm.setValue("has2FA", checked)
                              }
                            />
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">
                                  Recovery Email
                                </Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Icons.helpCircle className="text-muted-foreground size-3" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Backup email address for account recovery
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Input
                                {...metadataForm.register("recoveryEmail")}
                                placeholder="Recovery email address"
                                className="border-border focus:border-ring focus:ring-ring focus:ring-1"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium">
                                  Phone Number
                                </Label>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Icons.helpCircle className="text-muted-foreground size-3" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Phone number associated with this account
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <Input
                                {...metadataForm.register("phoneNumber")}
                                placeholder="Phone number"
                                className="border-border focus:border-ring focus:ring-ring focus:ring-1"
                              />
                            </div>
                          </div>

                          <EncryptedKeyValueForm
                            value={convertCredentialToGeneric(
                              metadataForm.watch("keyValuePairs") || []
                            )}
                            onChange={(genericKeyValuePairs) =>
                              metadataForm.setValue(
                                "keyValuePairs",
                                convertGenericToCredential(genericKeyValuePairs)
                              )
                            }
                            label="Additional Information"
                            description="Security questions, backup codes, or other important account information"
                            placeholder={{
                              key: "Enter key (e.g., Security Question)",
                              value: "Enter value (e.g., Mother's maiden name)",
                            }}
                          />
                        </Form>
                      </div>
                    )}
                  </div>
                </form>
              </Form>
            </div>

            {/* Sidebar */}
            <div className="sticky top-0 flex h-fit flex-col space-y-6">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Popover
                  open={statusPopoverOpen}
                  onOpenChange={setStatusPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <div className="w-full cursor-pointer">
                      <StatusBadge
                        status={credentialForm.watch("status")}
                        withPopover
                        isFullWidth
                      />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-40 p-2">
                    <div className="space-y-1">
                      {Object.entries(statusConfig).map(([status, config]) => (
                        <Button
                          key={status}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start gap-2 text-xs"
                          onClick={() =>
                            handleStatusChange(status as AccountStatusInfer)
                          }
                        >
                          <config.icon className="size-4" />
                          {config.label}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Container */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Container</Label>
                <ContainerSelector
                  currentContainerId={credentialForm.watch("containerId")}
                  entityType={EntityTypeEnum.CREDENTIAL}
                  onContainerChange={(containerId) =>
                    credentialForm.setValue("containerId", containerId)
                  }
                />
              </div>
            </div>
          </div>
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter>
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="create-more"
                checked={createMore}
                onCheckedChange={setCreateMore}
              />
              <label
                htmlFor="create-more"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Create another credential after saving
              </label>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
                disabled={createCredentialWithMetadataMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="credential-form"
                disabled={createCredentialWithMetadataMutation.isPending}
                onClick={(e) => {
                  e.preventDefault()
                  onSubmit()
                }}
              >
                {createCredentialWithMetadataMutation.isPending && (
                  <Icons.spinner className="mr-2 size-4 animate-spin" />
                )}
                Create Credential
              </Button>
            </div>
          </div>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
