"use client"

import { useCallback, useEffect, useState } from "react"
import { SecretDto } from "@/schemas/secrets/secret"
import { useForm } from "react-hook-form"

import { cn } from "@/lib/utils"

import { Icons } from "@/components/shared/icons"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SecretKeyValue {
  key: string
  value: string
  id: string
}

interface SecretFormProps {
  form: ReturnType<typeof useForm<SecretDto>>
  title?: string
  onTitleChange?: (title: string) => void
  sensitiveData: {
    value: string
  }
  setSensitiveData: React.Dispatch<
    React.SetStateAction<{
      value: string
    }>
  >
}

export function DashboardAddSecretForm({
  form,
  title = "",
  onTitleChange,
  sensitiveData,
  setSensitiveData,
}: SecretFormProps) {
  const [keyValuePairs, setKeyValuePairs] = useState<SecretKeyValue[]>([
    { id: "1", key: "", value: "" },
  ])

  const generateId = () => Math.random().toString(36).substring(2, 11)

  const parseEnvLine = useCallback(
    (envContent: string): { key: string; value: string } | null => {
      const trimmedLine = envContent.trim()

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith("#")) {
        return null
      }

      // Check if line contains an equals sign
      if (trimmedLine.includes("=")) {
        const [key, ...valueParts] = trimmedLine.split("=")
        const value = valueParts.join("=").replace(/^["']|["']$/g, "") // Remove quotes if present

        if (key.trim()) {
          return {
            key: key.trim(),
            value: value.trim(),
          }
        }
      }

      return null
    },
    []
  )

  const parseMultipleEnvLines = useCallback(
    (envContent: string): SecretKeyValue[] => {
      const lines = envContent.split("\n")
      const pairs: SecretKeyValue[] = []

      lines.forEach((line) => {
        const parsed = parseEnvLine(line)
        if (parsed) {
          pairs.push({
            id: generateId(),
            key: parsed.key,
            value: parsed.value,
          })
        }
      })

      return pairs.length > 0
        ? pairs
        : [{ id: generateId(), key: "", value: "" }]
    },
    [parseEnvLine]
  )

  const addKeyValuePair = useCallback(() => {
    setKeyValuePairs((prev) => [
      ...prev,
      { id: generateId(), key: "", value: "" },
    ])
  }, [])

  const removeKeyValuePair = useCallback(
    (id: string) => {
      if (keyValuePairs.length > 1) {
        setKeyValuePairs((prev) => prev.filter((pair) => pair.id !== id))
      }
    },
    [keyValuePairs.length]
  )

  const updateKeyValuePair = useCallback(
    (id: string, field: "key" | "value", newValue: string) => {
      setKeyValuePairs((prev) =>
        prev.map((pair) =>
          pair.id === id ? { ...pair, [field]: newValue } : pair
        )
      )
    },
    []
  )

  const handlePaste = useCallback(
    (id: string, field: "key" | "value", pastedText: string) => {
      // Check if pasting multiple lines (env file format)
      if (
        pastedText.includes("\n") ||
        (pastedText.includes("=") && field === "key")
      ) {
        const parsed = parseMultipleEnvLines(pastedText)
        setKeyValuePairs(parsed)
        return
      }

      // Normal single value paste
      updateKeyValuePair(id, field, pastedText)
    },
    [updateKeyValuePair, parseMultipleEnvLines]
  )

  // Update form values when keyValuePairs change
  useEffect(() => {
    if (keyValuePairs.length > 0) {
      // Use the first key as the name
      const firstName = keyValuePairs[0]?.key || ""
      const currentName = form.getValues("name")

      if (currentName !== firstName) {
        form.setValue("name", firstName)
      }

      // Create formatted value
      let formattedValue = ""
      if (keyValuePairs.length === 1) {
        formattedValue = keyValuePairs[0]?.value || ""
      } else {
        formattedValue = keyValuePairs
          .filter((pair) => pair.key.trim() && pair.value.trim())
          .map((pair) => `${pair.key}=${pair.value}`)
          .join("\n")
      }

      // Update sensitive data instead of form value
      const currentValue = sensitiveData.value
      if (currentValue !== formattedValue) {
        setSensitiveData({ value: formattedValue })
      }
    }
  }, [keyValuePairs, form, sensitiveData.value, setSensitiveData])

  // Initialize from form values if they exist (only on mount)
  useEffect(() => {
    const currentName = form.getValues("name")
    const currentValue = sensitiveData.value

    if (
      (currentName || currentValue) &&
      keyValuePairs.length === 1 &&
      !keyValuePairs[0].key &&
      !keyValuePairs[0].value
    ) {
      if (currentValue.includes("\n") || currentValue.includes("=")) {
        const parsed = parseMultipleEnvLines(`${currentName}=${currentValue}`)
        setKeyValuePairs(parsed)
      } else if (currentName || currentValue) {
        setKeyValuePairs([
          { id: generateId(), key: currentName, value: currentValue },
        ])
      }
    }
  }, [form, keyValuePairs, sensitiveData.value, parseMultipleEnvLines])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Title
        </Label>
        <Input
          id="title"
          placeholder="e.g., Production API Keys, Development Environment"
          value={title}
          onChange={(e) => onTitleChange?.(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">Secrets</Label>

        <div className="overflow-hidden rounded-lg border">
          <div className="space-y-0">
            {keyValuePairs.map((pair, index) => (
              <div
                key={pair.id}
                className={cn(
                  "flex items-start gap-2 p-3 sm:gap-3 sm:p-4",
                  index > 0 && "border-border border-t"
                )}
              >
                <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                  <div>
                    {index === 0 && (
                      <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                        Key
                      </Label>
                    )}
                    <Input
                      placeholder="API_SECRET_KEY"
                      value={pair.key}
                      onChange={(e) =>
                        updateKeyValuePair(pair.id, "key", e.target.value)
                      }
                      onPaste={(e) => {
                        e.preventDefault()
                        const pastedText = e.clipboardData.getData("text")
                        handlePaste(pair.id, "key", pastedText)
                      }}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    {index === 0 && (
                      <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                        Value
                      </Label>
                    )}
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="sk_test_abc123..."
                        value={pair.value}
                        onChange={(e) =>
                          updateKeyValuePair(pair.id, "value", e.target.value)
                        }
                        onPaste={(e) => {
                          e.preventDefault()
                          const pastedText = e.clipboardData.getData("text")
                          handlePaste(pair.id, "value", pastedText)
                        }}
                        className="flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {keyValuePairs.length > 1 && (
                  <div className={cn("flex", index === 0 ? "pt-6" : "pt-0")}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeKeyValuePair(pair.id)}
                      title="Remove this key-value pair"
                      className="text-muted-foreground hover:text-destructive flex flex-shrink-0 items-center justify-center"
                    >
                      <Icons.trash className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            <div className="border-border border-t p-3 sm:p-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addKeyValuePair}
                className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2"
              >
                <Icons.add className="size-4" />
                Add Another
              </Button>
            </div>
          </div>
        </div>

        <Alert variant="default">
          <AlertDescription className="flex flex-wrap items-center">
            💡 Pro tip: Paste multiple environment variables or{" "}
            <code className="bg-muted-foreground/20 mx-1 whitespace-nowrap rounded px-1">
              KEY=value
            </code>{" "}
            format into any field to auto-populate multiple rows.
          </AlertDescription>
        </Alert>
      </div>

      <FormField
        control={form.control}
        name="note"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Note</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Optional note about this secret..."
              />
            </FormControl>
            <FormDescription>
              Optional description to help identify this secret
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
