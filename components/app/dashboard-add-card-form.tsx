"use client"

import { useState } from "react"
import { CardEntity } from "@/entities"
import { CardDto, LIST_CARD_STATUSES, LIST_CARD_TYPES } from "@/schemas/card"
import { TagDto } from "@/schemas/utils/tag"
import { CardStatus } from "@prisma/client"
import { ChevronDown, Plus } from "lucide-react"
import { UseFormReturn } from "react-hook-form"

import { CardExpiryDateUtils } from "@/lib/card-expiry-utils"
import { cn, getMetadataLabels } from "@/lib/utils"

import { CardPaymentInputs } from "@/components/shared/card-payment-inputs"
import { CardStatusIndicator } from "@/components/shared/card-status-indicator"
import {
  getRandomSoftColor,
  TagSelector,
} from "@/components/shared/tag-selector"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  FormControl,
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

interface CardFormProps {
  form: UseFormReturn<CardDto>
  availableTags: TagDto[]
  setSensitiveData: React.Dispatch<
    React.SetStateAction<{
      number: string
      cvv: string
    }>
  >
}

export function DashboardAddCardForm({
  form,
  availableTags,
  setSensitiveData,
}: CardFormProps) {
  const [showMetadata, setShowMetadata] = useState(false)

  const hasMetadataValues = () => {
    const values = form.getValues()
    return !!(
      values.billingAddress ||
      values.cardholderEmail ||
      values.status !== CardStatus.ACTIVE
    )
  }

  const getMetadataLabelsForCard = () => {
    const values = form.getValues()
    const fieldMappings = {
      billingAddress: "Address",
      cardholderEmail: "Email",
      ...(values.status !== CardStatus.ACTIVE && { status: "Status" }),
    }
    return getMetadataLabels(values, fieldMappings)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="e.g., Chase Sapphire" />
              </FormControl>
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
                <Input {...field} placeholder="e.g., Work card" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <FormLabel>Card Details</FormLabel>
        <CardPaymentInputs
          onCardNumberChange={(value) => {
            setSensitiveData((prev) => ({ ...prev, number: value }))
          }}
          onExpiryChange={(value) => {
            CardExpiryDateUtils.handleFormExpiryChange(
              value,
              (fieldName, fieldValue) => {
                if (fieldName === "expiryDate") {
                  form.setValue("expiryDate", fieldValue)
                }
              },
              "expiryDate"
            )
          }}
          onCVCChange={(value) => {
            setSensitiveData((prev) => ({ ...prev, cvv: value }))
          }}
          onCardTypeChange={(cardType) => {
            form.setValue("provider", cardType)
          }}
        />
        <FormMessage />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <FormField
          control={form.control}
          name="cardholderName"
          render={({ field }) => (
            <FormItem className="w-full sm:flex-1">
              <FormLabel>Cardholder Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="John Doe"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full sm:w-24">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LIST_CARD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {CardEntity.convertCardTypeToString(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
            <FormMessage />
          </FormItem>
        )}
      />

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
                <Plus className="h-4 w-4" />
                <span className="font-medium">Additional Information</span>
              </div>
              {hasMetadataValues() && (
                <Badge variant="secondary" className="text-xs">
                  {getMetadataLabelsForCard()}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {showMetadata ? "Hide" : "Optional"}
              </span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showMetadata ? "rotate-180" : ""}`}
              />
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4">
          <div className="bg-muted/55 space-y-4 p-4">
            <FormField
              control={form.control}
              name="billingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 sm:flex-row">
              <FormField
                control={form.control}
                name="cardholderEmail"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="john@example.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="w-full sm:w-28">
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LIST_CARD_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            <CardStatusIndicator
                              status={status}
                              showText={true}
                            />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
