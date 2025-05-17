"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Copy, RefreshCw } from "lucide-react"
import { useForm } from "react-hook-form"
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
import { Switch } from "@/components/ui/switch"

// Define the form schema
const secretFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Secret value is required"),
  description: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "DELETED"]),
  platformId: z.string().min(1, "Platform is required"),
})

// Define the form values type
type SecretFormValues = z.infer<typeof secretFormSchema>

// Define the secret data type that will be sent to the server
// interface SecretData extends Omit<SecretFormValues, "tags" | "value"> {
//   value: string
//   encryptionKey: string
//   iv: string
//   tags: string[]
// }

interface AddSecretDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardAddSecretDialog({
  open,
  onOpenChange,
}: AddSecretDialogProps) {
  const [createMore, setCreateMore] = useState(false)
  const [secretStrength, setSecretStrength] = useState<{
    score: number
    feedback: string
  } | null>(null)

  const form = useForm<SecretFormValues>({
    resolver: zodResolver(secretFormSchema),
    defaultValues: {
      name: "",
      value: "",
      description: "",
      tags: "",
      status: "ACTIVE" as const,
      platformId: "",
    },
  })

  const handleGenerateSecret = () => {
    const newSecret = generatePassword(32) // Longer for secrets
    form.setValue("value", newSecret)
    setSecretStrength(checkPasswordStrength(newSecret))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  async function onSubmit(values: SecretFormValues) {
    try {
      // Generate encryption key
      // const key = await generateEncryptionKey()

      // // Encrypt the secret value
      // const { encryptedData, iv } = await encryptData(values.value, key)

      // // Export the key for storage
      // const keyString = await exportKey(key)

      // const tagsArray = values.tags
      //   ? values.tags.split(",").map((tag) => tag.trim())
      //   : []

      // onSave({
      //   ...values,
      //   value: encryptedData,
      //   encryptionKey: keyString,
      //   iv,
      //   tags: tagsArray,
      // })

      if (!createMore) {
        form.reset()
        setSecretStrength(null)
      }
    } catch (error) {
      console.error("Error encrypting secret:", error)
      // Handle error appropriately
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setCreateMore(false)
      setSecretStrength(null)
    }
    onOpenChange(open)
  }

  // Add secret strength indicator
  const getSecretStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return "text-red-500"
      case 2:
        return "text-orange-500"
      case 3:
        return "text-yellow-500"
      case 4:
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Secret</DialogTitle>
          <DialogDescription>
            Add a new secret to your vault. All information is securely stored.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    A name to identify this secret.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Value</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          setSecretStrength(
                            checkPasswordStrength(e.target.value)
                          )
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleGenerateSecret}
                      title="Generate secure secret"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const value = form.getValues("value")
                        if (value) copyToClipboard(value)
                      }}
                      title="Copy secret"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {secretStrength && (
                    <div className="mt-2 space-y-2">
                      <PasswordStrengthMeter score={secretStrength.score} />
                      <div className="text-muted-foreground text-sm">
                        {secretStrength.feedback}
                      </div>
                    </div>
                  )}
                  <FormDescription>
                    Your secret value. Use the generate button for a strong
                    secret.
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
                    Additional information about this secret.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated tags to categorize this secret.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                Create another secret after saving
              </label>
            </div>

            <Button type="submit">Save Secret</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
