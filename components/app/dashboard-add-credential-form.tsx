"use client"

import { CredentialDto } from "@/schemas/credential"
import { TagDto } from "@/schemas/utils/tag"
import { useForm } from "react-hook-form"

import { getLogoDevUrlWithToken, getPlaceholderImage } from "@/lib/utils"

import { Icons } from "@/components/shared/icons"
import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter"
import {
  getRandomSoftColor,
  TagSelector,
} from "@/components/shared/tag-selector"
import { Button } from "@/components/ui/button"
import { ComboboxResponsive } from "@/components/ui/combobox-responsive"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface CredentialFormProps {
  form: ReturnType<typeof useForm<CredentialDto>>
  platforms: Array<{ id: string; name: string; logo?: string | null }>
  availableTags: TagDto[]
  passwordStrength: { score: number; feedback: string } | null
  sensitiveData: {
    identifier: string
    password: string
  }
  setSensitiveData: React.Dispatch<
    React.SetStateAction<{
      identifier: string
      password: string
    }>
  >
  onPasswordChange: (password: string) => void
  onGeneratePassword: () => void
  onCopyPassword: () => void
  isCopied: boolean
}

export function DashboardAddCredentialForm({
  form,
  platforms,
  availableTags,
  passwordStrength,
  sensitiveData,
  setSensitiveData,
  onPasswordChange,
  onGeneratePassword,
  onCopyPassword,
  isCopied,
}: CredentialFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
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
                      getLogoDevUrlWithToken(platform.logo || null)
                    ),
                  }))}
                  selectedItem={
                    platforms.find((p) => p.id === field.value)
                      ? {
                          value: field.value,
                          label:
                            platforms.find((p) => p.id === field.value)?.name ||
                            "",
                        }
                      : null
                  }
                  onSelect={(item) => field.onChange(item?.value || "")}
                  placeholder="Select a platform"
                  searchPlaceholder="Search platforms..."
                  emptyText="No platforms found."
                />
              </FormControl>
              <FormDescription>
                Choose the platform or service for this credential
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
                <Input
                  {...field}
                  placeholder="e.g., Work account, Personal..."
                />
              </FormControl>
              <FormDescription>
                Optional description to help identify this account
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Identifier Field */}
      <FormItem>
        <FormLabel>Identifier</FormLabel>
        <FormControl>
          <Input
            value={sensitiveData.identifier}
            onChange={(e) =>
              setSensitiveData((prev) => ({
                ...prev,
                identifier: e.target.value,
              }))
            }
            placeholder="username, email, phone..."
          />
        </FormControl>
        <FormDescription>
          Your login identifier (username, email, phone number, etc.)
        </FormDescription>
        <FormMessage />
      </FormItem>

      {/* Password Field */}
      <FormItem>
        <FormLabel>Password</FormLabel>
        <div className="flex w-full gap-2">
          <FormControl className="min-w-0 flex-1">
            <Input
              variant="password"
              className="w-full"
              value={sensitiveData.password}
              onChange={(e) => {
                setSensitiveData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
                onPasswordChange(e.target.value)
              }}
              placeholder="Enter or generate a secure password"
            />
          </FormControl>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onGeneratePassword}
            title="Generate secure password"
          >
            <Icons.refresh className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onCopyPassword}
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
        <FormMessage />
      </FormItem>

      <FormField
        control={form.control}
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
              Add tags to help organize your credentials
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
