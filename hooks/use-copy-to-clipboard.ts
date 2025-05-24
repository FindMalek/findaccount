import { useCallback, useState } from "react"

interface UseCopyToClipboardOptions {
  successDuration?: number
  errorDuration?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface CopyToClipboardState {
  isCopied: boolean
  isError: boolean
  error: Error | null
}

export function useCopyToClipboard({
  successDuration = 2000,
  errorDuration = 2000,
  onSuccess,
  onError,
}: UseCopyToClipboardOptions = {}) {
  const [state, setState] = useState<CopyToClipboardState>({
    isCopied: false,
    isError: false,
    error: null,
  })

  const copyToClipboard = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)

        setState({ isCopied: true, isError: false, error: null })
        onSuccess?.()

        // Set timeout to reset state
        setTimeout(() => {
          setState((prev) => ({ ...prev, isCopied: false }))
        }, successDuration)

        return true
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Failed to copy")

        setState({ isCopied: false, isError: true, error: err })
        onError?.(err)

        // Set timeout to reset error state
        setTimeout(() => {
          setState((prev) => ({ ...prev, isError: false, error: null }))
        }, errorDuration)

        return false
      }
    },
    [successDuration, errorDuration, onSuccess, onError]
  )

  return {
    ...state,
    copy: copyToClipboard,
    reset: useCallback(() => {
      setState({ isCopied: false, isError: false, error: null })
    }, []),
  }
}
