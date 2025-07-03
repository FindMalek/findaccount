"use client"

import React from "react"
import { type CardProviderInfer } from "@/schemas/card"
import { usePaymentInputs } from "react-payment-inputs"
import images, { type CardImages } from "react-payment-inputs/images"
import { PaymentIcon } from "react-svg-credit-card-payment-icons"

import { CARD_PROVIDER_ICON_TYPE } from "@/config/consts"

import { Icons } from "@/components/shared/icons"

interface CardIconProps {
  manualCardType?: CardProviderInfer | null
  detectedCardType?: string
  showManualIndicator?: boolean
  width?: number
  height?: number
  className?: string
}

export function CardIcon({
  manualCardType,
  detectedCardType,
  showManualIndicator = true,
  width = 20,
  height = 12,
  className,
}: CardIconProps) {
  const { getCardImageProps } = usePaymentInputs()

  if (manualCardType) {
    const iconType = CARD_PROVIDER_ICON_TYPE[manualCardType]
    return (
      <div className={`relative ${className || ""}`}>
        <PaymentIcon
          type={iconType}
          format="flatRounded"
          width={width}
          height={height}
        />
        {showManualIndicator && (
          <div className="bg-primary absolute -right-1 -top-1 size-2 rounded-full" />
        )}
      </div>
    )
  } else if (detectedCardType) {
    return (
      <svg
        className={`overflow-hidden rounded-sm ${className || ""}`}
        {...getCardImageProps({
          images: images as unknown as CardImages,
        })}
        width={width}
      />
    )
  } else {
    return (
      <Icons.creditCard
        strokeWidth={2}
        className={`size-5 ${className || ""}`}
      />
    )
  }
}
