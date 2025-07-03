"use client"

import * as React from "react"
import { Eye, EyeOff, Copy, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "password" | "password-copyable"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const { isCopied, copy } = useCopyToClipboard()
    
    const toggleVisibility = () => setIsVisible((prev) => !prev)

    const handleCopy = async () => {
      if (props.value) {
        await copy(props.value.toString())
      }
    }

    if (variant === "password") {
      return (
        <div className="relative w-full">
          <input
            type={isVisible ? "text" : "password"}
            className={cn(
              "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pe-10 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            ref={ref}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-1">
            <Button
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              variant="ghost"
              size="icon"
            >
              {isVisible ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
      )
    }

    if (variant === "password-copyable") {
      return (
        <div className="relative w-full">
          <input
            type={isVisible ? "text" : "password"}
            className={cn(
              "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pe-20 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            ref={ref}
            {...props}
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-1">
            <Button
              type="button"
              onClick={toggleVisibility}
              aria-label={isVisible ? "Hide password" : "Show password"}
              aria-pressed={isVisible}
              variant="ghost"
              size="icon"
            >
              {isVisible ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </Button>
            <div
              className={`transition-all duration-300 ease-in-out ${
                isVisible ? "opacity-100 translate-x-0 w-8" : "opacity-0 translate-x-2 w-0"
              }`}
            >
              {isVisible && (
                <Button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy password"
                  variant="ghost"
                >
                  {isCopied ? (
                    <Check className="size-3 text-success" ria-hidden="true" />
                  ) : (
                    <Copy className="size-3" ria-hidden="true" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
