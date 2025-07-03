"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  CheckCircle2,
  Code,
  Construction,
  Pencil,
  Rocket,
  Sparkles,
  TestTube,
  Truck,
} from "lucide-react"

import { cn } from "@/lib/utils"

export type DevelopmentStage =
  | "planned"
  | "design"
  | "development"
  | "testing"
  | "production"

interface ComingSoonProps {
  title?: string
  description: string
  className?: string
  illustration?: "construction" | "rocket" | "sparkles"
  estimatedTime?: string
  stage?: DevelopmentStage
}

export function ComingSoon({
  title = "Coming Soon",
  description,
  className,
  illustration = "rocket",
  estimatedTime,
  stage = "planned",
}: ComingSoonProps) {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Define the stages and their properties
  const stages: Array<{
    id: DevelopmentStage
    label: string
    icon: React.ReactNode
  }> = [
    { id: "planned", label: "Planned", icon: <Pencil className="size-4" /> },
    {
      id: "design",
      label: "Design Interface",
      icon: <Pencil className="size-4" />,
    },
    {
      id: "development",
      label: "Development",
      icon: <Code className="size-4" />,
    },
    { id: "testing", label: "Testing", icon: <TestTube className="size-4" /> },
    {
      id: "production",
      label: "Production Ready",
      icon: <Truck className="size-4" />,
    },
  ]

  // Find the current stage index
  const currentStageIndex = stages.findIndex((s) => s.id === stage)

  return (
    <div
      className={cn(
        "mx-auto flex min-h-[50vh] w-full max-w-5xl flex-col items-center justify-center px-4 py-12",
        className
      )}
    >
      <div className="grid w-full items-center gap-8 md:grid-cols-2">
        <div className="order-2 flex flex-col space-y-6 text-center md:order-1 md:text-left">
          <div className="space-y-2">
            <div className="bg-primary/10 text-primary mb-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium">
              <span className="mr-2 animate-pulse">●</span>
              Under Development{dots}
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg">{description}</p>

            {estimatedTime && (
              <p className="text-muted-foreground mt-2 text-sm">
                Estimated arrival: {estimatedTime}
              </p>
            )}
          </div>
        </div>

        <div className="order-1 flex justify-center md:order-2">
          <div className="relative flex aspect-square w-full max-w-[300px] items-center justify-center">
            {illustration === "construction" && (
              <Construction className="text-primary size-32 animate-bounce" />
            )}

            {illustration === "rocket" && (
              <div className="relative">
                <div className="bg-primary/20 absolute -bottom-10 left-1/2 size-16 -translate-x-1/2 animate-pulse rounded-full blur-xl"></div>
                <Rocket className="text-primary size-32 animate-[bounce_3s_ease-in-out_infinite]" />
              </div>
            )}

            {illustration === "sparkles" && (
              <div className="relative">
                <Sparkles className="text-primary size-32 animate-pulse" />
                <div className="absolute left-0 top-0 size-full">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className="bg-primary absolute block size-2 animate-ping rounded-full"
                      style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${1 + Math.random() * 3}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="from-background to-background absolute inset-0 bg-gradient-to-r via-transparent md:hidden"></div>
          </div>
        </div>
      </div>

      <div className="mt-12 w-full border-t pt-8">
        <div className="flex flex-wrap justify-center gap-4">
          {stages.map((s, index) => {
            const isCompleted = index < currentStageIndex
            const isCurrent = index === currentStageIndex

            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isCompleted
                      ? "bg-primary/20 text-primary"
                      : "bg-muted"
                )}
              >
                {isCompleted ? <CheckCircle2 className="size-4" /> : s.icon}
                {s.label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
