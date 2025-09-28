
import * as React from "react"
import { SimpleSelect, type SimpleOption } from "./simple-select"
import { SimpleMultiSelect, type SimpleMultiOption } from "./simple-multi-select"

export interface CityOption {
  value: string
  label: string
}

interface CitySelectProps {
  options: CityOption[]
  multiple?: boolean
  value?: string | string[]
  onChange: (value: string | string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CitySelect({
  options,
  multiple = false,
  value,
  onChange,
  placeholder = "Select city...",
  disabled = false,
  className,
}: CitySelectProps) {
  const simpleOptions: SimpleOption[] = options.map(option => ({
    value: option.value,
    label: option.label
  }))

  const multiOptions: SimpleMultiOption[] = options.map(option => ({
    value: option.value,
    label: option.label
  }))

  if (multiple) {
    return (
      <SimpleMultiSelect
        options={multiOptions}
        selected={Array.isArray(value) ? value : []}
        onChange={(selected) => onChange(selected)}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
    )
  }

  return (
    <SimpleSelect
      options={simpleOptions}
      value={typeof value === 'string' ? value : ''}
      onValueChange={(newValue) => onChange(newValue)}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
    />
  )
}