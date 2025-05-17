"use client"

import { useEffect, useState } from "react"
import { CredentialSchemaDto, type CredentialDto } from "@/schemas/credential"
import { PlatformSimpleRo } from "@/schemas/platform"
import { zodResolver } from "@hookform/resolvers/zod"
import { AccountStatus } from "@prisma/client"
import { Copy, RefreshCw } from "lucide-react"
import { useForm, type FieldValues } from "react-hook-form"
import * as z from "zod"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { checkPasswordStrength, generatePassword } from "@/lib/password"

import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { listPlatforms } from "@/actions/platform"

interface CredentialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormValues = {
  username: string
  password: string
  platformId: string
  status: AccountStatus
  description?: string
  loginUrl?: string
  containerId?: string
}

export function DashboardAddCredentialDialog({
  open,
  onOpenChange,
}: CredentialDialogProps) {
  const [createMore, setCreateMore] = useState(false)
  const [platforms, setPlatforms] = useState<PlatformSimpleRo[]>([])
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    feedback: string
  } | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(CredentialSchemaDto) as any,
    defaultValues: {
      username: "",
      password: "",
      loginUrl: "",
      description: "",
      status: AccountStatus.ACTIVE,
      platformId: "",
      containerId: "",
    },
  })

  useEffect(() => {
    const fetchPlatforms = async () => {
      const result = await listPlatforms(1, 100)
      if (result.success && result.platforms) {
        setPlatforms(result.platforms)
      }
    }
    fetchPlatforms()
  }, [])

  const handleGeneratePassword = () => {
    const newPassword = generatePassword(16)
    form.setValue("password", newPassword)
    setPasswordStrength(checkPasswordStrength(newPassword))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  async function onSubmit(values: FormValues) {
    try {
      // Generate encryption key
      const key = await generateEncryptionKey()

      // Encrypt the password
      const { encryptedData, iv } = await encryptData(values.password, key)

      // Export the key for storage
      const keyString = await exportKey(key)

      // TODO: Save the credential with encrypted data
      console.log("Saving credential:", {
        ...values,
        password: encryptedData,
        encryptionKey: keyString,
        iv,
      })

      if (!createMore) {
        form.reset()
        setPasswordStrength(null)
      }
    } catch (error) {
      console.error("Error encrypting password:", error)
      // Handle error appropriately
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setCreateMore(false)
      setPasswordStrength(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add New Credential</DialogTitle>
          <DialogDescription>
            Add a new credential to your vault. All information is securely
            stored.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Left column - Important fields */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="platformId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {platforms.map((platform) => (
                            <SelectItem key={platform.id} value={platform.id}>
                              {platform.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the platform for this credential.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Your username or email for this account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="flex w-full gap-2">
                        <FormControl className="min-w-0 flex-1">
                          <Input
                            type="password"
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
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            copyToClipboard(form.getValues("password"))
                          }
                          title="Copy password"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      {passwordStrength && (
                        <div className="mt-2 space-y-2">
                          <PasswordStrengthMeter
                            score={passwordStrength.score}
                          />
                          <div className="text-muted-foreground text-sm">
                            {passwordStrength.feedback}
                          </div>
                        </div>
                      )}
                      <FormDescription>
                        Your secure password. Use the generate button for a
                        strong password.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right column - Optional fields */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="loginUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL where you can log in to this account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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

                <FormField
                  control={form.control}
                  name="containerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Container ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional container ID for organizing credentials.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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

            <Button type="submit">Save Credential</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
