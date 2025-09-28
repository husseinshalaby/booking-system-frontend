

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { countries } from "@/config/locations";
import { CALLING_CODES } from "@/config/calling-codes";

const getCallingCode = (code: string) => {
  if (!code) throw new Error("Country code is required");
  const callingCode = CALLING_CODES[code.toUpperCase()];
  if (!callingCode) throw new Error(`Calling code not found for country: ${code}`);
  return callingCode;
};

interface Country {
  value: string
  label: string
  flag: string
  code: string
  cities: { value: string; label: string }[]
}

function useAvailableCountries() {
  return useMemo<Country[]>(() => {
    return countries.map(country => ({
      ...country,
      name: country.label
    }));
  }, []);
}

function formatPhone(country: Country, digitsOnly: string) {
  const cc = getCallingCode(country.code);
  return `+${cc}${digitsOnly}`;
}

function extractDigits(value: string) {
  return (value || "").replace(/\D/g, "");
}

function digitsWithoutCode(value: string, country: Country) {
  const cc = getCallingCode(country.code);
  const m = (value || "").match(/^\+(\d+)/);
  if (!m) return extractDigits(value);
  const leading = m[1];
  if (leading.startsWith(cc)) {
    return extractDigits(value.slice(1 + cc.length));
  }

  return extractDigits(value.replace(/^\+\d+/, ""));
}

interface PhoneInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  id?: string;
}

const CountryPicker: React.FC<{
  countries: Country[];
  selected: Country;
  onSelect: (c: Country) => void;
  isOpen: boolean;
  onToggle: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  panelRef?: React.RefObject<HTMLDivElement | null>;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}> = ({
  countries,
  selected,
  onSelect,
  isOpen,
  onToggle,
  buttonRef,
  panelRef,
  searchInputRef,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCountries = countries.filter(
    (country) =>
      country.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (country: Country) => {
    onSelect(country);
    setSearchTerm("");
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        variant="ghost"
        className="h-9 px-2 rounded-l-md rounded-r-none border-r gap-1 hover:bg-muted/50"
      >
        <span className="text-lg leading-none">{selected.flag}</span>
        {countries.length > 1 && (
          <ChevronDown
            className={cn(
              "h-3 w-3 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        )}
      </Button>

      {isOpen && countries.length > 1 && (
        <div
          ref={panelRef}
          className="absolute z-50 left-0 top-full mt-1 bg-popover border border-border rounded-md shadow-md overflow-hidden min-w-[320px]"
        >
          {countries.length > 3 && (
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search country..."
                  className="w-full pl-8 text-sm"
                />
              </div>
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <Button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  variant="ghost"
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none transition-colors justify-start h-auto",
                    selected.code === country.code && "bg-accent text-accent-foreground"
                  )}
                >
                  <span className="text-lg leading-none">{country.flag}</span>
                  <span className="flex-1 text-sm font-medium truncate">
                    {country.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    +{getCallingCode(country.code)}
                  </span>
                  {selected.code === country.code && (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
  placeholder = "Phone number",
  value,
  onChange,
  error,
  id,
}) => {
  const availableCountries = useAvailableCountries();
  const [isOpen, setIsOpen] = useState(false);

  const [selected, setSelected] = useState<Country>(() => {
    if (!availableCountries.length) {
      return { value: 'au', label: 'Australia', flag: '🇦🇺', code: 'AU', cities: [] };
    }
    
    const fallback = availableCountries.find((c) => c.code === "AU") || availableCountries[0];
    if (!value) return fallback;
    const m = value.match(/^\+(\d+)/);
    if (!m) return fallback;
    const selectedFromValue = availableCountries.find(
      (c) => c.code && getCallingCode(c.code) === m[1]
    );
    return selectedFromValue || fallback;
  });

  useEffect(() => {
    if (!availableCountries.length) return;
    if (!availableCountries.some((c) => c.code === selected?.code)) {
      const newSelected = availableCountries[0];
      if (newSelected) {
        setSelected(newSelected);
        const digits = digitsWithoutCode(value, newSelected);
        onChange(formatPhone(newSelected, digits));
      }
    }

  }, [availableCountries]);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const prefix = useMemo(() => `+${getCallingCode(selected?.code)}`, [selected]);
  const localDigits = useMemo(
    () => selected ? digitsWithoutCode(value, selected) : "",
    [value, selected]
  );

  const handleCountrySelect = (c: Country) => {
    setSelected(c);
    const digits = digitsWithoutCode(value, c);
    onChange(formatPhone(c, digits));
    setIsOpen(false);

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleToggle = () => {
    if (availableCountries.length <= 1) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent text-sm transition-colors focus-within:ring-1 focus-within:ring-ring",
          error && "border-destructive focus-within:border-destructive focus-within:ring-destructive"
        )}
      >
        <CountryPicker
          countries={availableCountries}
          selected={selected}
          onSelect={handleCountrySelect}
          isOpen={isOpen}
          onToggle={handleToggle}
          buttonRef={buttonRef}
          panelRef={panelRef}
          searchInputRef={searchInputRef}
        />

        <span className="flex items-center px-3 text-sm text-muted-foreground select-none border-r border-border">
          {prefix}
        </span>

        <Input
          ref={inputRef}
          type="tel"
          inputMode="tel"
          placeholder={placeholder}
          value={localDigits}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            onChange(formatPhone(selected, digits));
          }}
          id={id}
          className="flex-1 bg-transparent px-3 border-none py-1 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 rounded-l-none rounded-r-md"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </>
  );
};