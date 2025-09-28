
import * as React from "react"
import { Check, ChevronDown, PlusCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface DataTableFacetedFilterProps<TData, TValue> {
  title?: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
  selectedValues?: string[]
  onChange?: (values: string[]) => void
  searchPlaceholder?: string
  maxSelections?: number
}

export function DataTableFacetedFilter<TData, TValue>({
  title,
  options,
  selectedValues = [],
  onChange,
  searchPlaceholder = "Search...",
  maxSelections,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const selectedOptions = selectedValues.map(value => 
    options.find(option => option.value === value)
  ).filter(Boolean) as Array<{label: string; value: string; icon?: React.ComponentType<{ className?: string }>}>
  
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

  const handleSelect = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value]
    
    if (maxSelections && newValues.length > maxSelections) {
      return
    }
    
    onChange?.(newValues)
  }

  const handleRemove = (value: string) => {
    onChange?.(selectedValues.filter(v => v !== value))
  }

  const handleClear = () => {
    onChange?.([])
  }

  return (
    <div className="relative w-auto min-w-[150px]" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "flex h-8 items-center justify-between rounded-md border border-dashed border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-accent hover:text-accent-foreground",
          "border-dashed"
        )}
      >
        <div className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>{title}</span>
          {selectedValues.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.length}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.length > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.length} selected
                  </Badge>
                ) : (
                  selectedOptions.map((option) => (
                    <Badge
                      variant="secondary"
                      key={option.value}
                      className="rounded-sm px-1 font-normal"
                    >
                      {option.label}
                    </Badge>
                  ))
                )}
              </div>
            </>
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 min-w-[200px] max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md">
          <div className="p-2">
            <input
              type="text"
              placeholder={searchPlaceholder}
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
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    selectedValues.includes(option.value) && "bg-accent text-accent-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedValues.includes(option.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                  <div className="flex items-center">
                    {option.icon && (
                      <option.icon className="mr-2 h-4 w-4 shrink-0" />
                    )}
                    {option.label}
                  </div>
                </button>
              ))
            )}
            {selectedValues.length > 0 && (
              <div className="border-t mt-1 pt-1">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex w-full items-center justify-center rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}