"use client"

import { useEffect, useState } from "react"
import {
  CredentialDto,
  CredentialMetadataDto,
  CredentialMetadataSchemaDto,
  CredentialSchemaDto,
} from "@/schemas/credential"
import { TagDto } from "@/schemas/tag"
import { zodResolver } from "@hookform/resolvers/zod"
import { AccountStatus } from "@prisma/client"
import { useForm } from "react-hook-form"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { checkPasswordStrength, generatePassword } from "@/lib/password"
import {
  getLogoDevUrlWithToken,
  getPlaceholderImage,
  handleErrors,
} from "@/lib/utils"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { usePlatforms } from "@/hooks/use-platforms"
import { useTags } from "@/hooks/use-tags"
import { useToast } from "@/hooks/use-toast"

import { AddItemDialog } from "@/components/shared/add-item-dialog"
import { Icons } from "@/components/shared/icons"
import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter"
import {
  getRandomSoftColor,
  TagSelector,
} from "@/components/shared/tag-selector"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ComboboxResponsive } from "@/components/ui/combobox-responsive"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { createCredentialWithMetadata } from "@/actions/credential"

interface CredentialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardAddCredentialDialog({
  open,
  onOpenChange,
}: CredentialDialogProps) {
  const { platforms, error: platformsError } = usePlatforms()
  const { tags: availableTags, error: tagsError } = useTags()

  const [createMore, setCreateMore] = useState(false)
  const [activeTab, setActiveTab] = useState("credential")
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    feedback: string
  } | null>(null)

  const { copy, isCopied } = useCopyToClipboard({
    successDuration: 1500,
  })

  const { toast, toastLoading, dismiss, dismissAll } = useToast()

  const credentialForm = useForm<CredentialDto>({
    resolver: zodResolver(CredentialSchemaDto),
    defaultValues: {
      username: "",
      password: "",
      description: "",
      status: AccountStatus.ACTIVE,
      platformId: "",
      containerId: "",
      encryptionKey: "",
      iv: "",
      tags: [],
    },
  })

  const metadataForm = useForm<CredentialMetadataDto>({
    resolver: zodResolver(CredentialMetadataSchemaDto),
    defaultValues: {
      recoveryEmail: "",
      phoneNumber: "",
      otherInfo: "",
      has2FA: false,
      credentialId: "",
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

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
    credentialForm.setValue("password", newPassword)
    setPasswordStrength(checkPasswordStrength(newPassword))
  }

  // Handle credential form submission (navigate to metadata tab)
  async function onCredentialSubmit(values: CredentialDto) {
    try {
      const key = await generateEncryptionKey()
      const encryptResult = await encryptData(values.password, key)
      const keyString = await exportKey(key)

      const credentialToSave: CredentialDto = {
        ...values,
        password: encryptResult.encryptedData,
        encryptionKey: keyString,
        iv: encryptResult.iv,
      }

      credentialForm.reset(credentialToSave)
      setActiveTab("metadata")
    } catch (error: unknown) {
      console.error("Encryption error:", error)
      const { message, details } = handleErrors(error, "Encryption failed")
      toast(
        details
          ? `${message}: ${Array.isArray(details) ? details.join(", ") : details}`
          : message,
        "error"
      )
    }
  }

  async function onFinalSubmit(metadataValues: CredentialMetadataDto) {
    try {
      setIsSubmitting(true)
      const loadingToast = toastLoading("Saving credential...")

      const credentialData = credentialForm.getValues()

      const credentialDto: CredentialDto = {
        username: credentialData.username,
        password: credentialData.password,
        encryptionKey: credentialData.encryptionKey,
        iv: credentialData.iv,
        status: credentialData.status,
        tags: credentialData.tags,
        description: credentialData.description,
        platformId: credentialData.platformId,
        containerId: credentialData.containerId,
      }

      // Filter out empty metadata fields and convert to DTO format
      const metadataDto: Omit<CredentialMetadataDto, "credentialId"> = {
        has2FA: metadataValues.has2FA,
      }

      if (
        metadataValues.recoveryEmail &&
        metadataValues.recoveryEmail.trim() !== ""
      ) {
        metadataDto.recoveryEmail = metadataValues.recoveryEmail
      }
      if (
        metadataValues.phoneNumber &&
        metadataValues.phoneNumber.trim() !== ""
      ) {
        metadataDto.phoneNumber = metadataValues.phoneNumber
      }
      if (metadataValues.otherInfo && metadataValues.otherInfo.trim() !== "") {
        metadataDto.otherInfo = metadataValues.otherInfo
      }

      // Only send metadata if there are meaningful values (not just default has2FA)
      const hasMetadata =
        metadataDto.recoveryEmail ||
        metadataDto.phoneNumber ||
        metadataDto.otherInfo ||
        metadataDto.has2FA

      const result = await createCredentialWithMetadata(
        credentialDto,
        hasMetadata ? metadataDto : undefined
      )

      dismiss(loadingToast.id)

      if (result.success) {
        toast("Credential saved successfully", "success")

        if (!createMore) {
          handleDialogOpenChange(false)
        } else {
          // Reset both forms for creating another credential
          credentialForm.reset({
            username: "",
            password: "",
            description: "",
            status: AccountStatus.ACTIVE,
            platformId: credentialData.platformId,
            containerId: credentialData.containerId,
            encryptionKey: "",
            iv: "",
            tags: [],
          })
          metadataForm.reset({
            recoveryEmail: "",
            phoneNumber: "",
            otherInfo: "",
            has2FA: false,
          })
          setPasswordStrength(null)
          setActiveTab("credential")
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
      dismissAll()

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
      setCreateMore(false)
      setPasswordStrength(null)
      setActiveTab("credential")
    }
    onOpenChange(open)
  }

  return (
    <AddItemDialog
      open={open}
      onOpenChange={handleDialogOpenChange}
      title="Add New Credential"
      description="Add a new credential to your vault. All information is securely stored."
      isSubmitting={isSubmitting}
      createMore={createMore}
      onCreateMoreChange={setCreateMore}
      createMoreText="Create another credential"
      submitText={
        activeTab === "credential" ? "Continue to Metadata" : "Save Credential"
      }
      formId={activeTab === "credential" ? "credential-form" : "metadata-form"}
      className="sm:max-w-[800px]"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="credential">Credential</TabsTrigger>
          <TabsTrigger value="metadata" disabled={activeTab === "credential"}>
            Metadata
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credential" className="space-y-4">
          <Form {...credentialForm}>
            <form
              id="credential-form"
              onSubmit={credentialForm.handleSubmit(onCredentialSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Left column - Important fields */}
                <div className="space-y-4">
                  <FormField
                    control={credentialForm.control}
                    name="platformId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <FormControl>
                          <ComboboxResponsive
                            items={platforms.map((platform) => ({
                              value: platform.id,
                              label: platform.name,
                              logo: getPlaceholderImage(
                                platform.name,
                                getLogoDevUrlWithToken(platform.logo)
                              ),
                            }))}
                            selectedItem={
                              platforms.find((p) => p.id === field.value)
                                ? {
                                    value: field.value,
                                    label:
                                      platforms.find(
                                        (p) => p.id === field.value
                                      )?.name || "",
                                  }
                                : null
                            }
                            onSelect={(item) =>
                              field.onChange(item?.value || "")
                            }
                            placeholder="Select a platform"
                            searchPlaceholder="Search platforms..."
                            emptyText="No platforms found."
                          />
                        </FormControl>
                        <FormDescription>
                          Select the platform for this credential.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right column - Optional fields */}
                <div className="space-y-4">
                  <FormField
                    control={credentialForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Additional information about this account.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={credentialForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identifier</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Your identifier for this account. This could be your
                      username, email, phone number, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={credentialForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <div className="flex w-full gap-2">
                      <FormControl className="min-w-0 flex-1">
                        <Input
                          variant="password"
                          className="w-full"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            setPasswordStrength(
                              checkPasswordStrength(e.target.value)
                            )
                          }}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGeneratePassword}
                        title="Generate secure password"
                      >
                        <Icons.refresh className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          copy(credentialForm.getValues("password"))
                        }
                        title="Copy password"
                      >
                        {isCopied ? (
                          <Icons.check className="text-success h-4 w-4" />
                        ) : (
                          <Icons.copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {passwordStrength && (
                      <div className="mt-2 space-y-2">
                        <PasswordStrengthMeter score={passwordStrength.score} />
                        <div className="text-muted-foreground text-sm">
                          {passwordStrength.feedback}
                        </div>
                      </div>
                    )}
                    <FormDescription>
                      Your secure password. Use the generate button for a strong
                      password.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={credentialForm.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <TagSelector<TagDto>
                        availableTags={availableTags}
                        selectedTags={field.value}
                        onChange={field.onChange}
                        getValue={(tag) => tag.name}
                        getLabel={(tag) => tag.name}
                        createTag={(name) => ({
                          name,
                          color: getRandomSoftColor(),
                          userId: undefined,
                          containerId: undefined,
                        })}
                      />
                    </FormControl>
                    <FormDescription>
                      Add tags to help organize your credentials.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <Form {...metadataForm}>
            <form
              id="metadata-form"
              onSubmit={metadataForm.handleSubmit(onFinalSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={metadataForm.control}
                  name="recoveryEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recovery Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormDescription>
                        Email address for account recovery.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={metadataForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormDescription>
                        Phone number associated with this account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={metadataForm.control}
                name="has2FA"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Two-Factor Authentication</FormLabel>
                      <FormDescription>
                        This account has two-factor authentication enabled.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={metadataForm.control}
                name="otherInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Any other relevant information about this credential.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </AddItemDialog>
  )
}
