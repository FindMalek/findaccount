"use client"

import { toast as sonnerToast } from "sonner"

type ToastVariant = "success" | "error" | "info" | "warning" | "loading"
type DismissableToast = { id: string; dismiss: () => void }

/**
 * Custom hook for toast notifications with improved developer experience.
 *
 * ## Basic Usage:
 * ```tsx
 * // In your component
 * const { toast } = useToast()
 *
 * // Show a success toast
 * toast("Operation successful", "success")
 *
 * // Show an error toast
 * toast("Something went wrong", "error")
 * ```
 *
 * ## Loading Toast:
 * ```tsx
 * const { toastLoading } = useToast()
 *
 * async function handleOperation() {
 *   const loadingToast = toastLoading("Processing...")
 *   try {
 *     await someAsyncOperation()
 *     loadingToast.dismiss()
 *     toast("Operation successful", "success")
 *   } catch (error) {
 *     loadingToast.dismiss()
 *     toast("Failed: " + error.message, "error")
 *   }
 * }
 * ```
 *
 * ## Promise Toast:
 * ```tsx
 * const { toastPromise } = useToast()
 *
 * function handleOperation() {
 *   toastPromise(
 *     someAsyncOperation(),
 *     {
 *       loading: "Processing...",
 *       success: (data) => `Success: ${data.message}`,
 *       error: (err) => {
 *         const { message } = handleErrors(err)
 *         return message
 *       }
 *     }
 *   )
 * }
 * ```
 *
 * ## Persistent Toast:
 * ```tsx
 * const { toastPersistent, dismiss } = useToast()
 *
 * function showImportantMessage() {
 *   const toast = toastPersistent("Important notification", "info")
 *   // Later, when you want to dismiss it:
 *   dismiss(toast.id)
 * }
 * ```
 *
 * ## With Error Handling:
 * ```tsx
 * import { handleErrors } from "@/lib/utils"
 *
 * try {
 *   // Some operation that might fail
 * } catch (error) {
 *   const { message, details } = handleErrors(error)
 *   toast(
 *     Array.isArray(details)
 *       ? `${message}: ${details.join(", ")}`
 *       : `${message}: ${details || ""}`,
 *     "error"
 *   )
 * }
 * ```
 */
export function useToast() {
  /**
   * Show a toast notification with specified variant
   */
  const toast = (
    message: string,
    variant: ToastVariant = "info",
    duration = 3000
  ) => {
    switch (variant) {
      case "success":
        return sonnerToast.success(message, { duration })
      case "error":
        return sonnerToast.error(message, { duration })
      case "warning":
        return sonnerToast.warning(message, { duration })
      case "loading":
        return sonnerToast.loading(message, { duration })
      default:
        return sonnerToast(message, { duration })
    }
  }

  /**
   * Show a toast notification with a promise
   */
  const toastPromise = <T>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    }
  ) => {
    return sonnerToast.promise(promise, options)
  }

  /**
   * Show a loading toast and return a function to dismiss it
   */
  const toastLoading = (message: string): DismissableToast => {
    const toastId = String(sonnerToast.loading(message))
    return {
      id: toastId,
      dismiss: () => sonnerToast.dismiss(toastId),
    }
  }

  /**
   * Show a persistent toast that needs to be dismissed manually
   */
  const toastPersistent = (
    message: string,
    variant: Omit<ToastVariant, "loading"> = "info"
  ): DismissableToast => {
    let toastId: string

    switch (variant) {
      case "success":
        toastId = String(sonnerToast.success(message, { duration: Infinity }))
        break
      case "error":
        toastId = String(sonnerToast.error(message, { duration: Infinity }))
        break
      case "warning":
        toastId = String(sonnerToast.warning(message, { duration: Infinity }))
        break
      default:
        toastId = String(sonnerToast(message, { duration: Infinity }))
    }

    return {
      id: toastId,
      dismiss: () => sonnerToast.dismiss(toastId),
    }
  }

  /**
   * Dismiss a specific toast by ID
   */
  const dismiss = (id: string) => {
    sonnerToast.dismiss(id)
  }

  /**
   * Dismiss all toasts
   */
  const dismissAll = () => {
    sonnerToast.dismiss()
  }

  return {
    toast,
    toastPromise,
    toastLoading,
    toastPersistent,
    dismiss,
    dismissAll,
  }
}
