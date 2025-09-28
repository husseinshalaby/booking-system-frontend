"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { customerRegistrationSchema, type CustomerRegistrationFormData } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SimpleSelect, type SimpleOption } from "@/components/ui/simple-select"
import { CitySelect } from "@/components/ui/city-select"
import { PhoneInput } from "@/components/ui/phone-input"
import { SharedErrorDisplay } from "@/components/ui/shared-error-display"
import { LoadingLabel } from "@/components/ui/loading-label"
import { countries, getCitiesByCountry } from "@/config/locations"
import { customerApi } from "@/lib/api"
import { toast } from "sonner"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [phoneValue, setPhoneValue] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CustomerRegistrationFormData, string>>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const availableCities = selectedCountry ? getCitiesByCountry(selectedCountry) : []

  const countryOptions: SimpleOption[] = countries.map(country => ({
    value: country.value,
    label: country.label,
    flag: country.flag
  }))
  const router = useRouter()

  const handleSkipRegistration = () => {
    router.push('/customers')
  }

  const validateField = (fieldName: keyof CustomerRegistrationFormData, value: string | undefined) => {
    if (!hasSubmitted) return
    
    const fieldValidation = customerRegistrationSchema.pick({ [fieldName]: true }).safeParse({ [fieldName]: value })
    
    if (fieldValidation.success) {
      setFieldErrors(prev => {
        const updated = { ...prev }
        delete updated[fieldName]
        return updated
      })
    } else {
      const error = fieldValidation.error.issues[0]
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: error.message
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setFieldErrors({})
    setHasSubmitted(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const address = formData.get('address') as string

    const validationData = {
      name,
      email,
      password,
      confirmPassword,
      phone: phoneValue,
      address: address || undefined,
      country: selectedCountry,
      city: selectedCity,
    }

    const validation = customerRegistrationSchema.safeParse(validationData)
    
    if (!validation.success) {
      const errors: Partial<Record<keyof CustomerRegistrationFormData, string>> = {}
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof CustomerRegistrationFormData
        if (field) {
          errors[field] = issue.message
        }
      })
      setFieldErrors(errors)
      setIsLoading(false)
      return
    }

    const [firstName, ...lastNameParts] = name.split(' ')
    const lastName = lastNameParts.join(' ')

    try {
      const countryLabel = countries.find(c => c.value === selectedCountry)?.label || selectedCountry
      const cityLabel = availableCities.find(c => c.value === selectedCity)?.label || selectedCity

      const result = await customerApi.register({
        firstName,
        lastName,
        email,
        password,
        phone: phoneValue,
        address: address || undefined,
        country: countryLabel,
        city: cityLabel,
      })

      if (result) {
        toast.success('Account created successfully!')
        
        const signInResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (signInResult?.ok) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          router.push('/customers')
        } else {
          setError('Registration successful, but sign-in failed. Please try logging in.')
        }
      } else {
        setError('Registration failed')
      }
    } catch (error) {
      let errorMessage = 'Something went wrong. Please try again.'
      
      if (error instanceof Error) {
        if (error.message?.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the server. Please check your connection and try again.'
        } else if (error.message?.includes('already exists')) {
          errorMessage = 'An account with this email already exists. Please use a different email or try logging in.'
        } else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
             
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    disabled={isLoading}
                    className={fieldErrors.name ? "border-red-500" : ""}
                    onChange={(e) => validateField('name', e.target.value)}
                  />
                  {fieldErrors.name && (
                    <p className="text-sm text-red-500">{fieldErrors.name}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    disabled={isLoading}
                    className={fieldErrors.email ? "border-red-500" : ""}
                    onChange={(e) => validateField('email', e.target.value)}
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-red-500">{fieldErrors.email}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password *</Label>
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    disabled={isLoading}
                    className={fieldErrors.password ? "border-red-500" : ""}
                    onChange={(e) => validateField('password', e.target.value)}
                  />
                  {fieldErrors.password && (
                    <p className="text-sm text-red-500">{fieldErrors.password}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword"
                    type="password" 
                    disabled={isLoading}
                    className={fieldErrors.confirmPassword ? "border-red-500" : ""}
                    onChange={(e) => {
                      const confirmPassword = e.target.value
                      const password = (document.getElementById('password') as HTMLInputElement)?.value || ''
                      
                      if (hasSubmitted) {
                        const validation = customerRegistrationSchema.pick({ password: true, confirmPassword: true }).safeParse({ 
                          password, 
                          confirmPassword 
                        })
                        
                        if (validation.success) {
                          setFieldErrors(prev => {
                            const updated = { ...prev }
                            delete updated.confirmPassword
                            return updated
                          })
                        } else {
                          const error = validation.error.issues.find(issue => issue.path[0] === 'confirmPassword')
                          if (error) {
                            setFieldErrors(prev => ({
                              ...prev,
                              confirmPassword: error.message
                            }))
                          }
                        }
                      }
                    }}
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="text-sm text-red-500">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="phone">Phone *</Label>
                  <PhoneInput
                    id="phone"
                    placeholder="Enter phone number"
                    value={phoneValue}
                    onChange={(value) => {
                      setPhoneValue(value)
                      validateField('phone', value)
                    }}
                    error={fieldErrors.phone}
                  />
                  {fieldErrors.phone && (
                    <p className="text-sm text-red-500">{fieldErrors.phone}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="123 Main St"
                    disabled={isLoading}
                    className={fieldErrors.address ? "border-red-500" : ""}
                    onChange={(e) => validateField('address', e.target.value)}
                  />
                  {fieldErrors.address && (
                    <p className="text-sm text-red-500">{fieldErrors.address}</p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="country">Country *</Label>
                  <SimpleSelect
                    options={countryOptions}
                    value={selectedCountry}
                    onValueChange={(value) => {
                      setSelectedCountry(value)
                      setSelectedCity('')
                      validateField('country', value)
                    }}
                    className={fieldErrors.country ? "border-red-500" : ""}
                    placeholder="Select a country"
                    disabled={isLoading}
                  />
                  {fieldErrors.country && (
                    <p className="text-sm text-red-500">{fieldErrors.country}</p>
                  )}
                </div>
                {selectedCountry && (
                  <div className="grid gap-3">
                    <Label htmlFor="city">City *</Label>
                    <CitySelect
                      options={availableCities}
                      multiple={false}
                      value={selectedCity}
                      onChange={(value) => {
                        setSelectedCity(value as string)
                        validateField('city', value as string)
                      }}
                      className={fieldErrors.city ? "border-red-500" : ""}
                      placeholder="Select a city"
                      disabled={isLoading}
                    />
                    {fieldErrors.city && (
                      <p className="text-sm text-red-500">{fieldErrors.city}</p>
                    )}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <LoadingLabel 
                      loading={true} 
                      message="Creating Account..." 
                      className="w-full"
                      childClassName="justify-center"
                    />
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleSkipRegistration}
                  disabled={isLoading}
                >
                  Continue as Guest
                </Button>
              </div>
              <SharedErrorDisplay 
                error={error} 
                onDismiss={() => setError(null)}
                className="mt-4"
              />
              
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/customers/login" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}