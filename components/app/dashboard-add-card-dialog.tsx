"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Copy, RefreshCw } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { checkPasswordStrength, generatePassword } from "@/lib/password"

import { AddItemDialog } from "@/components/shared/add-item-dialog"
import { PasswordStrengthMeter } from "@/components/shared/password-strength-meter"
import { Button } from "@/components/ui/button"
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

// Define the form schema
const cardFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  cardNumber: z.string().min(1, "Card number is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  cvv: z.string().min(1, "CVV is required"),
  pin: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "DELETED"]),
  platformId: z.string().min(1, "Platform is required"),
})

// Define the form values type
type CardFormValues = z.infer<typeof cardFormSchema>

// Define the card data type that will be sent to the server
// interface CardData extends Omit<CardFormValues, "tags" | "cvv" | "pin"> {
//   cvv: string
//   pin: string
//   encryptionKey: string
//   iv: string
//   tags: string[]
// }

interface AddCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DashboardAddCardDialog({
  open,
  onOpenChange,
}: AddCardDialogProps) {
  const [createMore, setCreateMore] = useState(false)
  const [pinStrength, setPinStrength] = useState<{
    score: number
    feedback: string
  } | null>(null)

  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      name: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      pin: "",
      description: "",
      tags: "",
      status: "ACTIVE" as const,
      platformId: "",
    },
  })

  const handleGeneratePin = () => {
    const newPin = generatePassword(4)
    form.setValue("pin", newPin)
    setPinStrength(checkPasswordStrength(newPin))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function onSubmit(_values: CardFormValues) {
    try {
      // Generate encryption key
      // const key = await generateEncryptionKey()

      // // Encrypt sensitive data
      // const { encryptedData: encryptedCvv, iv: cvvIv } = await encryptData(
      //   values.cvv,
      //   key
      // )
      // const { encryptedData: encryptedPin, iv: pinIv } = values.pin
      //   ? await encryptData(values.pin, key)
      //   : { encryptedData: "", iv: "" }

      // // Export the key for storage
      // const keyString = await exportKey(key)

      // const tagsArray = values.tags
      //   ? values.tags.split(",").map((tag) => tag.trim())
      //   : []

      // onSave({
      //   ...values,
      //   cvv: encryptedCvv,
      //   pin: encryptedPin,
      //   encryptionKey: keyString,
      //   iv: cvvIv, // Using CVV IV as the main IV
      //   tags: tagsArray,
      // })

      if (!createMore) {
        form.reset()
        setPinStrength(null)
      }
    } catch (error) {
      console.error("Error encrypting card data:", error)
      // Handle error appropriately
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      setCreateMore(false)
      setPinStrength(null)
    }
    onOpenChange(open)
  }

  return (
    <AddItemDialog
      open={open}
      onOpenChange={handleDialogOpenChange}
      title="Add New Card"
      description="Add a new card to your vault. All information is securely stored."
      createMore={createMore}
      onCreateMoreChange={setCreateMore}
      createMoreText="Create another card"
      submitText="Save Card"
      formId="card-form"
      className="sm:max-w-[550px]"
    >
      <Form {...form}>
        <form
          id="card-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>A name to identify this card.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cardNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>Your card number.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input placeholder="MM/YY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cvv"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CVV</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIN</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        setPinStrength(checkPasswordStrength(e.target.value))
                      }}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleGeneratePin}
                    title="Generate secure PIN"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const pin = form.getValues("pin")
                      if (pin) copyToClipboard(pin)
                    }}
                    title="Copy PIN"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {pinStrength && (
                  <div className="mt-2 space-y-2">
                    <PasswordStrengthMeter score={pinStrength.score} />
                    <div className="text-muted-foreground text-sm">
                      {pinStrength.feedback}
                    </div>
                  </div>
                )}
                <FormDescription>
                  Your card PIN. Use the generate button for a secure PIN.
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
                  Additional information about this card.
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
                  Comma-separated tags to categorize this card.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </AddItemDialog>
  )
}
