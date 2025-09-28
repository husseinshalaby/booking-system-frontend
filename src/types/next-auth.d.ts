import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      userType: string
      firstName: string
      lastName: string
      phone: string
      address: string
      country: string
      city?: string
      serviceType?: string
      description?: string
      hourlyRate?: number
      photo?: string
      cities?: string[]
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    userType: string
    firstName: string
    lastName: string
    phone: string
    address: string
    country: string
    accessToken?: string
    city?: string
    serviceType?: string
    description?: string
    hourlyRate?: number
    photo?: string
    cities?: string[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    userType: string
    firstName: string
    lastName: string
    phone: string
    address: string
    country: string
    accessToken?: string
    city?: string
    serviceType?: string
    description?: string
    hourlyRate?: number
    photo?: string
    cities?: string[]
  }
}