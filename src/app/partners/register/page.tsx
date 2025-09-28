"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { signIn } from "next-auth/react"
import { partnerRegistrationSchema, type PartnerRegistrationFormData } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SimpleSelect, type SimpleOption } from "@/components/ui/simple-select"
import { CitySelect } from "@/components/ui/city-select"
import { Badge } from "@/components/ui/badge"
import { PhoneInput } from "@/components/ui/phone-input"
import { SharedErrorDisplay } from "@/components/ui/shared-error-display"
import { LoadingLabel } from "@/components/ui/loading-label"
import { Upload, User } from "lucide-react"
import { countries, getCitiesByCountry } from "@/config/locations"
import { professions } from "@/config/professions"

export default function PartnerRegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedProfession, setSelectedProfession] = useState("")
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null)
  const [phoneValue, setPhoneValue] = useState<string>("")
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PartnerRegistrationFormData, string>>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const router = useRouter()

  const availableCities = selectedCountry ? getCitiesByCountry(selectedCountry) : []

  const countryOptions: SimpleOption[] = countries.map(country => ({
    value: country.value,
    label: country.label,
    flag: country.flag
  }))

  const professionOptions: SimpleOption[] = professions.map(prof => ({
    value: prof.value,
    label: prof.label,
    icon: prof.icon
  }))

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedPhoto(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateField = (fieldName: keyof PartnerRegistrationFormData, value: string | number | string[] | undefined) => {
    if (!hasSubmitted) return
    
    const fieldValidation = partnerRegistrationSchema.pick({ [fieldName]: true }).safeParse({ [fieldName]: value })
    
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
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const description = formData.get('description') as string
    const hourlyRate = parseFloat(formData.get('hourlyRate') as string) || 0

    const validationData = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone: phoneValue,
      description,
      profession: selectedProfession,
      hourlyRate,
      country: selectedCountry,
      cities: selectedCities,
      photo: uploadedPhoto || undefined
    }

    const validation = partnerRegistrationSchema.safeParse(validationData)
    
    if (!validation.success) {
      const errors: Partial<Record<keyof PartnerRegistrationFormData, string>> = {}
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof PartnerRegistrationFormData
        if (field) {
          errors[field] = issue.message
        }
      })
      setFieldErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}/auth/register/partner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone: phoneValue,
          description,
          serviceType: selectedProfession,
          hourlyRate,
          country: selectedCountry,
          cities: selectedCities,
          photo: uploadedPhoto || null
        }),
      })

      if (!response.ok) {
        try {
          const errorData = await response.json()
          setError(errorData.message || 'Registration failed. Please try again.')
        } catch {
          if (response.status === 400) {
            setError('Invalid registration data. Please check your inputs.')
          } else if (response.status === 409) {
            setError('An account with this email already exists. Please use a different email or try logging in.')
          } else if (response.status === 500) {
            setError('Server error. Please try again later.')
          } else {
            setError('Registration failed. Please try again.')
          }
        }
        return
      }

      const result = await response.json()

      if (result.success) {
        try {
          const signInResult = await signIn('credentials', {
            email,
            password,
            redirect: false,
          })

          if (signInResult?.ok) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            router.push('/partners')
          } else if (signInResult?.error) {
            setError(`Registration successful, but sign-in failed: ${signInResult.error}. Please try logging in manually.`)
          } else {
            setError('Registration successful, but sign-in failed. Please try logging in.')
          }
        } catch (signInError) {
          setError('Registration successful, but automatic sign-in failed. Please try logging in manually.')
        }
      } else {
        setError(result.message || 'Registration failed. Please try again.')
      }
    } catch (error) {
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please try again later.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <Image
            src="/logo.jpeg" 
            alt="Adam Logo" 
            width={32}
            height={32}
            className="size-8 rounded-md object-cover"
          />
          Adam
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Join as a Professional Partner</CardTitle>
            <CardDescription>
              Create your professional profile and start connecting with customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      disabled={isLoading}
                      className={fieldErrors.firstName ? "border-red-500" : ""}
                      onChange={(e) => validateField('firstName', e.target.value)}
                    />
                    {fieldErrors.firstName && (
                      <p className="text-sm text-red-500">{fieldErrors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      disabled={isLoading}
                      className={fieldErrors.lastName ? "border-red-500" : ""}
                      onChange={(e) => validateField('lastName', e.target.value)}
                    />
                    {fieldErrors.lastName && (
                      <p className="text-sm text-red-500">{fieldErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    disabled={isLoading}
                    className={fieldErrors.email ? "border-red-500" : ""}
                    onChange={(e) => validateField('email', e.target.value)}
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-red-500">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
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

              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Security</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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
                            const validation = partnerRegistrationSchema.pick({ password: true, confirmPassword: true }).safeParse({ 
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
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Service Location</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <SimpleSelect
                    options={countryOptions}
                    value={selectedCountry}
                    onValueChange={(value) => {
                      setSelectedCountry(value)
                      setSelectedCities([])
                      validateField('country', value)
                    }}
                    placeholder="Select your country"
                    disabled={isLoading}
                    className={fieldErrors.country ? "border-red-500" : ""}
                  />
                  {fieldErrors.country && (
                    <p className="text-sm text-red-500">{fieldErrors.country}</p>
                  )}
                </div>

                {selectedCountry && (
                  <div className="space-y-2">
                    <Label htmlFor="cities">Cities You Serve *</Label>
                    <CitySelect
                      options={availableCities}
                      multiple={true}
                      value={selectedCities}
                      onChange={(cities) => {
                        const cityArray = Array.isArray(cities) ? cities : []
                        setSelectedCities(cityArray)
                        validateField('cities', cityArray)
                      }}
                      placeholder="Select cities where you provide services"
                      disabled={isLoading}
                    />
                    {fieldErrors.cities && (
                      <p className="text-sm text-red-500">{fieldErrors.cities}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession *</Label>
                  <SimpleSelect
                    options={professionOptions}
                    value={selectedProfession}
                    onValueChange={(value) => {
                      setSelectedProfession(value)
                      validateField('profession', value)
                    }}
                    placeholder="Select your profession"
                    disabled={isLoading}
                    className={fieldErrors.profession ? "border-red-500" : ""}
                  />
                  {fieldErrors.profession && (
                    <p className="text-sm text-red-500">{fieldErrors.profession}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly Rate (USD) *</Label>
                  <Input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    step="0.01"
                    placeholder="50.00"
                    disabled={isLoading}
                    className={fieldErrors.hourlyRate ? "border-red-500" : ""}
                    onChange={(e) => validateField('hourlyRate', parseFloat(e.target.value) || 0)}
                  />
                  {fieldErrors.hourlyRate && (
                    <p className="text-sm text-red-500">{fieldErrors.hourlyRate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your experience and services..."
                    rows={3}
                    disabled={isLoading}
                    className={fieldErrors.description ? "border-red-500" : ""}
                    onChange={(e) => validateField('description', e.target.value)}
                  />
                  {fieldErrors.description && (
                    <p className="text-sm text-red-500">{fieldErrors.description}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <LoadingLabel 
                    loading={true} 
                    message="Creating Account..." 
                    className="w-full"
                    childClassName="justify-center"
                  />
                ) : (
                  "Create Professional Account"
                )}
              </Button>

              <SharedErrorDisplay 
                error={error} 
                onDismiss={() => setError(null)}
                className="mt-4"
              />

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/partners/login" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
        <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
          By creating an account, you agree to our <a href="#">Terms of Service</a>{" "}
          and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  )
}