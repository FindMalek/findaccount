"use client"

import { useState } from "react"
import { GenericEncryptedKeyValuePairDto } from "@/schemas/encryption/encryption"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Icons } from "./icons"

interface EncryptedKeyValueFormProps {
  value: GenericEncryptedKeyValuePairDto[]
  onChange: (value: GenericEncryptedKeyValuePairDto[]) => void
  label?: string
  description?: string
  placeholder?: {
    key?: string
    value?: string
  }
  className?: string
  disabled?: boolean
}

export function EncryptedKeyValueForm({
  value = [],
  onChange,
  label = "Additional Information",
  description = "Store sensitive key-value pairs with encrypted values",
  placeholder = {
    key: "Enter key ",
    value: "Enter value",
  },
  className,
  disabled = false,
}: EncryptedKeyValueFormProps) {
  const [localPairs, setLocalPairs] = useState<
    Array<{
      id: string
      key: string
      value: string
      isEncrypting?: boolean
    }>
  >(() => {
    if (value.length === 0) {
      return [{ id: `temp_${Date.now()}`, key: "", value: "" }]
    }
    return value.map((pair) => ({
      id: pair.id || `temp_${Date.now()}_${Math.random()}`,
      key: pair.key,
      value: "", // Don't display encrypted values
    }))
  })

  const handleAddPair = () => {
    const newPair = {
      id: `temp_${Date.now()}_${Math.random()}`,
      key: "",
      value: "",
    }
    setLocalPairs([...localPairs, newPair])
  }

  const handleRemovePair = async (id: string) => {
    const updatedLocal = localPairs.filter((pair) => pair.id !== id)
    setLocalPairs(updatedLocal)

    // Update the parent with encrypted values
    const updatedValue = value.filter((pair) => pair.id !== id)
    onChange(updatedValue)
  }

  const handleKeyChange = (id: string, newKey: string) => {
    setLocalPairs((prev) =>
      prev.map((pair) => (pair.id === id ? { ...pair, key: newKey } : pair))
    )
  }

  const handleValueChange = (id: string, newValue: string) => {
    setLocalPairs((prev) =>
      prev.map((pair) => (pair.id === id ? { ...pair, value: newValue } : pair))
    )
  }

  const handlePaste = (
    id: string,
    field: "key" | "value",
    pastedText: string
  ) => {
    if (field === "key") {
      handleKeyChange(id, pastedText)
    } else {
      handleValueChange(id, pastedText)
    }
  }

  const encryptAndUpdatePair = async (id: string) => {
    const localPair = localPairs.find((pair) => pair.id === id)
    if (!localPair || !localPair.key.trim() || !localPair.value.trim()) {
      return
    }

    try {
      // Set encrypting state
      setLocalPairs((prev) =>
        prev.map((pair) =>
          pair.id === id ? { ...pair, isEncrypting: true } : pair
        )
      )

      // Generate encryption key and encrypt value
      const key = await generateEncryptionKey()
      const encryptResult = await encryptData(localPair.value, key)
      const keyString = await exportKey(key as CryptoKey)

      const encryptedPair: GenericEncryptedKeyValuePairDto = {
        id: localPair.id.startsWith("temp_")
          ? `kv_${Date.now()}`
          : localPair.id,
        key: localPair.key,
        valueEncryption: {
          encryptedValue: encryptResult.encryptedData,
          iv: encryptResult.iv,
          encryptionKey: keyString,
        },
      }

      // Update the parent with the new encrypted pair
      const existingIndex = value.findIndex((pair) => pair.id === id)
      let updatedValue: GenericEncryptedKeyValuePairDto[]

      if (existingIndex >= 0) {
        updatedValue = [...value]
        updatedValue[existingIndex] = encryptedPair
      } else {
        updatedValue = [...value, encryptedPair]
      }

      onChange(updatedValue)

      // Update local state - clear the value and update ID if it was temporary
      setLocalPairs((prev) =>
        prev.map((pair) =>
          pair.id === id
            ? {
                ...pair,
                id: encryptedPair.id || pair.id,
                value: "", // Clear the value after encryption
                isEncrypting: false,
              }
            : pair
        )
      )
    } catch (error) {
      console.error("Failed to encrypt value:", error)

      // Reset encrypting state on error
      setLocalPairs((prev) =>
        prev.map((pair) =>
          pair.id === id ? { ...pair, isEncrypting: false } : pair
        )
      )
    }
  }

  const getEncryptedPair = (
    id: string
  ): GenericEncryptedKeyValuePairDto | undefined => {
    return value.find((pair) => pair.id === id)
  }

  const handleKeyBlur = (id: string) => {
    const localPair = localPairs.find((pair) => pair.id === id)
    if (localPair?.key.trim() && localPair?.value.trim()) {
      encryptAndUpdatePair(id)
    }
  }

  const handleValueBlur = (id: string) => {
    const localPair = localPairs.find((pair) => pair.id === id)
    if (localPair?.key.trim() && localPair?.value.trim()) {
      encryptAndUpdatePair(id)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Icons.helpCircle className="text-muted-foreground size-3" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="space-y-0">
          {localPairs.map((localPair, index) => {
            const encryptedPair = getEncryptedPair(localPair.id)
            const hasEncryptedValue = Boolean(encryptedPair)

            return (
              <div
                key={localPair.id}
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
                      placeholder={placeholder.key}
                      value={localPair.key}
                      onChange={(e) =>
                        handleKeyChange(localPair.id, e.target.value)
                      }
                      onBlur={() => handleKeyBlur(localPair.id)}
                      onPaste={(e) => {
                        e.preventDefault()
                        const pastedText = e.clipboardData.getData("text")
                        handlePaste(localPair.id, "key", pastedText)
                      }}
                      disabled={disabled || localPair.isEncrypting}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    {index === 0 && (
                      <Label className="text-muted-foreground mb-2 block text-xs uppercase tracking-wide">
                        Value
                      </Label>
                    )}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          variant="password"
                          placeholder={
                            hasEncryptedValue
                              ? "Value encrypted and saved"
                              : placeholder.value
                          }
                          value={localPair.value}
                          onChange={(e) =>
                            handleValueChange(localPair.id, e.target.value)
                          }
                          onBlur={() => handleValueBlur(localPair.id)}
                          onPaste={(e) => {
                            e.preventDefault()
                            const pastedText = e.clipboardData.getData("text")
                            handlePaste(localPair.id, "value", pastedText)
                          }}
                          disabled={disabled || localPair.isEncrypting}
                          className={cn("pr-8 font-mono text-xs")}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {localPairs.length > 1 && (
                  <div className={cn("flex", index === 0 ? "pt-6" : "pt-0")}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePair(localPair.id)}
                      disabled={disabled || localPair.isEncrypting}
                      title="Remove this key-value pair"
                      className="text-muted-foreground hover:text-destructive flex flex-shrink-0 items-center justify-center"
                    >
                      <Icons.trash className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}

          <div className="border-border border-t p-3 sm:p-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddPair}
              disabled={disabled}
              className="text-muted-foreground hover:text-foreground flex w-full items-center gap-2"
            >
              <Icons.add className="size-4" />
              Add Another
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
