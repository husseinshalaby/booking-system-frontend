import { countries } from "@/config/locations"

interface CountryFlagProps {
  country?: string;
  className?: string;
}

export function CountryFlag({ country, className = "" }: CountryFlagProps) {
  if (!country) {
    return (
      <span className={`inline-block text-lg ${className}`} title="Default">
        🌍
      </span>
    );
  }
  
  const countryLower = country.toLowerCase();
  
  const countryData = countries.find(c => 
    c.value.toLowerCase() === countryLower || 
    c.label.toLowerCase() === countryLower
  );
  
  const flag = countryData?.flag;
  
  if (!flag) {
    return (
      <span className={`inline-block text-lg ${className}`} title={country}>
        🏳️
      </span>
    );
  }
  
  return (
    <span className={`inline-block text-lg ${className}`} title={country}>
      {flag}
    </span>
  );
}