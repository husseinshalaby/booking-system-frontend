"use client"

import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function PartnersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status === 'unauthenticated') {
      router.push('/partners/register')
      return
    }

    if (session && session.user.userType !== 'partner') {
      router.push('/partners/register')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <DashboardLayout portalType="partners">
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <Skeleton className="h-9 w-80 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-lg">
              <Skeleton className="h-7 w-24 mb-2" />
              <Skeleton className="h-5 w-64 mb-4" />
              <Skeleton className="h-5 w-40" />
            </div>
            
            <div className="p-6 border rounded-lg">
              <Skeleton className="h-7 w-32 mb-2" />
              <Skeleton className="h-5 w-56 mb-4" />
              <Skeleton className="h-5 w-36" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated' || (session && session.user.userType !== 'partner')) {
    return null
  }

  return (
    <DashboardLayout portalType="partners">
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Partner Portal, {session?.user?.firstName}!</h1>
        <p className="text-muted-foreground">
          Use the sidebar to navigate between Availability and Bookings management
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Availability</h2>
          <p className="text-muted-foreground mb-4">
            Set your available time slots for services
          </p>
          <Link 
            href="/partners/availability" 
            className="text-blue-600 hover:underline"
          >
            Manage Availability →
          </Link>
        </div>
        
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Bookings Overview</h2>
          <p className="text-muted-foreground mb-4">
            View and manage your assigned jobs
          </p>
          <Link 
            href="/partners/bookings" 
            className="text-blue-600 hover:underline"
          >
            View Bookings →
          </Link>
        </div>
      </div>
    </div>
  </DashboardLayout>
  )
}