"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import { FunctionComponent } from "react"

interface LoadingLabelProps {
  loading?: boolean
  message?: string
  className?: string
  childClassName?: string
  textClassName?: string
  spinnerSrc?: string
  spinnerSize?: number
}

export const LoadingLabel: FunctionComponent<LoadingLabelProps> = ({
  loading = false,
  message = "Loading...",
  className,
  childClassName,
  textClassName,
  spinnerSrc = "/loading-spinner.gif",
  spinnerSize = 16,
}) => {
  if (!loading) return null

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("flex items-center gap-2", childClassName)}>
        <Image
          src={spinnerSrc}
          alt="Loading"
          width={spinnerSize}
          height={spinnerSize}
          unoptimized
        />
        <span className={cn("text-sm", textClassName)}>
          {message}
        </span>
      </div>
    </div>
  )
}