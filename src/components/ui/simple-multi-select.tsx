
import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SimpleMultiOption {
  value: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface SimpleMultiSelectProps {
  options: SimpleMultiOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SimpleMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  disabled = false,
  className,
}: SimpleMultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const selectedOptions = selected.map(value => 
    options.find(option => option.value === value)
  ).filter(Boolean) as SimpleMultiOption[]
  
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    setSearchTerm("")
  }

  const handleSelect = (option: SimpleMultiOption) => {
    if (selected.includes(option.value)) {

      onChange(selected.filter(value => value !== option.value))
    } else {

      onChange([...selected, option.value])
    }
  }

  const handleRemove = (value: string) => {
    onChange(selected.filter(v => v !== value))
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          selectedOptions.length === 0 && "text-muted-foreground",
          className
        )}
      >
        <div className="flex flex-wrap gap-1 max-w-full">
          {selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground"
              >
                {option.icon && (
                  <option.icon className="h-3 w-3" />
                )}
                {option.label}
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(option.value)
                  }}
                  className="ml-1 rounded-sm hover:bg-secondary-foreground/20 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </span>
              </span>
            ))
          ) : (
            <span>{placeholder}</span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div className="p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm">No results found.</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    selected.includes(option.value) && "bg-accent text-accent-foreground"
                  )}
                >
                  <div className="flex items-center">
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 shrink-0" />
                    )}
                    {option.label}
                  </div>
                  {selected.includes(option.value) && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}