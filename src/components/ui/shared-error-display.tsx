"use client"

import { AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SharedErrorDisplayProps {
  error: string | null
  onDismiss?: () => void
  className?: string
  title?: string
}

export function SharedErrorDisplay({ error, onDismiss, className, title = "Registration Failed" }: SharedErrorDisplayProps) {
  if (!error) return null

  const getUserFriendlyMessage = (errorMessage: string): string => {
    const lowerError = errorMessage.toLowerCase()

    if (lowerError.includes("unknown column") || lowerError.includes("field list")) {
      return "We're experiencing technical difficulties. Please try again later or contact support if the problem persists."
    }

    if (lowerError.includes("connection") && (lowerError.includes("refused") || lowerError.includes("timeout"))) {
      return "Unable to connect to our servers. Please check your internet connection and try again."
    }

    if (lowerError.includes("validation") || lowerError.includes("invalid")) {
      return "Please check your information and try again."
    }

    if (lowerError.includes("email") && (lowerError.includes("exists") || lowerError.includes("duplicate"))) {
      return "An account with this email already exists. Please use a different email or try logging in."
    }

    if (lowerError.includes("server error") || lowerError.includes("internal error")) {
      return "Our servers are experiencing issues. Please try again in a few minutes."
    }

    if (lowerError.includes("failed to fetch") || lowerError.includes("network")) {
      return "Connection failed. Please check your internet connection and try again."
    }

    if (lowerError.includes("database") || lowerError.includes("sql")) {
      return "We're experiencing technical difficulties. Please try again later."
    }

    if (errorMessage.length > 100 || lowerError.includes("error:") || lowerError.includes("exception")) {
      return "Something went wrong. Please try again later."
    }
    
    return errorMessage
  }

  const friendlyMessage = getUserFriendlyMessage(error)

  return (
    <div className={cn(
      "flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800/30 dark:bg-red-900/10 dark:text-red-400",
      className
    )}>
      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm mt-1">{friendlyMessage}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 transition-colors"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}