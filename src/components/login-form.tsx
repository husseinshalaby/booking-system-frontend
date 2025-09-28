
"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { loginSchema, type LoginFormData } from "@/lib/validations"
import { UserType } from "@/lib/constants"
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
import { SharedErrorDisplay } from "@/components/ui/shared-error-display"
import { LoadingLabel } from "@/components/ui/loading-label"

interface LoginFormProps extends React.ComponentProps<"div"> {
  userType?: UserType
}

export function LoginForm({
  className,
  userType,
  ...props
}: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})
  const router = useRouter()
  
  const signupRoute = userType === UserType.PARTNERS 
    ? "/partners/register" 
    : userType === UserType.CUSTOMERS 
    ? "/customers/signup" 
    : "/signup"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const validation = loginSchema.safeParse({ email, password })
    
    if (!validation.success) {
      const errors: Partial<Record<keyof LoginFormData, string>> = {}
      validation.error.issues.forEach((error) => {
        const field = error.path[0] as keyof LoginFormData
        if (field) {
          errors[field] = error.message
        }
      })
      setFieldErrors(errors)
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const session = await getSession()
        
        if (session?.user) {
          if (session.user.userType === 'customer') {
            router.push('/customers')
          } else if (session.user.userType === 'partner') {
            router.push('/partners')
          } else {
            router.push('/dashboard')
          }
        } else {
          router.push('/partners')
        }
      } else if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (result.error === 'AccessDenied') {
          setError('Access denied. Your account may be inactive or suspended.')
        } else if (result.error === 'Configuration') {
          setError('Service temporarily unavailable. Please try again later.')
        } else {
          setError('Unable to sign in. Please check your credentials and try again.')
        }
      } else {
        setError('Invalid email or password. Please check your credentials and try again.')
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your professional account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  disabled={isLoading}
                  className={fieldErrors.email ? "border-red-500" : ""}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500">{fieldErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password *</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  disabled={isLoading}
                  className={fieldErrors.password ? "border-red-500" : ""}
                />
                {fieldErrors.password && (
                  <p className="text-sm text-red-500">{fieldErrors.password}</p>
                )}
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <LoadingLabel 
                  loading={true} 
                  message="Signing in..." 
                  className="w-full"
                  childClassName="justify-center"
                />
              ) : (
                "Sign In"
              )}
            </Button>

            <SharedErrorDisplay 
              error={error} 
              onDismiss={() => setError(null)}
              className="mt-4"
              title="Sign In Failed"
            />

            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href={signupRoute} className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
