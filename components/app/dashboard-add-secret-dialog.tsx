"use client"

import { useState } from "react"
import { SecretDto, secretDtoSchema } from "@/schemas/secrets/secret"
import { zodResolver } from "@hookform/resolvers/zod"
import { SecretStatus, SecretType } from "@prisma/client"
import { useForm } from "react-hook-form"

import { encryptData, exportKey, generateEncryptionKey } from "@/lib/encryption"
import { handleErrors } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

import { DashboardAddSecretForm } from "@/components/app/dashboard-add-secret-form"
import { AddItemDialog } from "@/components/shared/add-item-dialog"
import { Icons } from "@/components/shared/icons"
import { Form } from "@/components/ui/form"

import { createSecret } from "@/actions/secrets/secret"

interface SecretDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardAddSecretDialog({
  open,
  onOpenChange,
}: SecretDialogProps) {
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [createMore, setCreateMore] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sensitiveData, setSensitiveData] = useState({
    value: "",
  })

  const form = useForm<SecretDto>({
    resolver: zodResolver(secretDtoSchema),
    defaultValues: {
      name: "",
      note: "",
      valueEncryption: {
        encryptedValue: "",
        iv: "",
        encryptionKey: "",
      },
      metadata: [{
        type: SecretType.API_KEY,
        status: SecretStatus.ACTIVE,
        otherInfo: [],
        secretId: "",
      }],
    },
  })



  async function onSubmit() {
    try {
      setIsSubmitting(true)

      if (!sensitiveData.value.trim()) {
        toast("Secret value is required", "error")
        return
      }

      const key = await generateEncryptionKey()
      const encryptResult = await encryptData(sensitiveData.value, key)
      const keyString = await exportKey(key as CryptoKey)

      form.setValue("valueEncryption", {
        encryptedValue: encryptResult.encryptedData,
        iv: encryptResult.iv,
        encryptionKey: keyString,
      })

      const isValid = await form.trigger()
      if (!isValid) {
        toast("Please fill in all required fields", "error")
        return
      }

      const secretData = form.getValues()

      if (title && !secretData.name) {
        secretData.name = title
      }

      const secretDto: SecretDto = {
        name: secretData.name,
        valueEncryption: {
          encryptedValue: encryptResult.encryptedData,
          iv: encryptResult.iv,
          encryptionKey: keyString,
        },
        note: secretData.note,
        metadata: secretData.metadata,
        containerId: secretData.containerId,
      }

      const result = await createSecret(secretDto)

      if (result.success) {
        toast("Secret saved successfully", "success")

        if (!createMore) {
          handleDialogOpenChange(false)
        } else {
          form.reset({
            name: "",
            note: "",
            valueEncryption: {
              encryptedValue: "",
              iv: "",
              encryptionKey: "",
            },
            metadata: [{
              type: SecretType.API_KEY,
              status: SecretStatus.ACTIVE,
              otherInfo: [],
              secretId: "",
            }],
          })
          setSensitiveData({ value: "" })
          setTitle("")
        }
      } else {
        const errorDetails = result.issues
          ? result.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ")
          : result.error

        toast(
          `Failed to save secret: ${errorDetails || "Unknown error"}`,
          "error"
        )
      }
    } catch (error) {
      const { message, details } = handleErrors(error, "Failed to save secret")
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
      form.reset()
      setSensitiveData({ value: "" })
      setTitle("")
      setCreateMore(false)
    }
    onOpenChange(open)
  }

  return (
    <AddItemDialog
      open={open}
      onOpenChange={handleDialogOpenChange}
      title="Add New Secret"
      description="Add a new secret to your vault. All information is securely stored."
      icon={<Icons.key className="size-5" />}
      isSubmitting={isSubmitting}
      createMore={createMore}
      onCreateMoreChange={setCreateMore}
      createMoreText="Create another secret"
      submitText="Save Secret"
      formId="secret-form"
      className="sm:max-w-[800px]"
    >
      <Form {...form}>
        <form
          id="secret-form"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="space-y-6"
        >
          <DashboardAddSecretForm
            form={form}
            title={title}
            onTitleChange={setTitle}
            sensitiveData={sensitiveData}
            setSensitiveData={setSensitiveData}
          />
        </form>
      </Form>
    </AddItemDialog>
  )
}
