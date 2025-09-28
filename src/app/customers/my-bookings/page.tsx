"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/dashboard-layout"
import { bookingsApi } from "@/lib/api"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { CustomerBooking, statusConfig } from "@/types/booking"

export default function MyOrdersPage() {
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<CustomerBooking[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status === 'authenticated' && session?.user?.id) {
      fetchMyBookings()
    } else {
      setIsInitialLoading(false)
    }
  }, [status, session?.user?.id])

  const fetchMyBookings = async () => {
    try {
      if (!session?.user?.id) return;
      const myBookings = await bookingsApi.getByCustomer(Number(session.user.id)) as CustomerBooking[]
      setBookings(myBookings || [])
    } catch (error) {
      toast.error('Failed to load your orders')
      setBookings([])
    } finally {
      setIsInitialLoading(false)
    }
  }

  const formatDateForDisplay = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTimeForDisplay = (time: string) => {
    let timeStr = time
    if (time.includes('T')) {
      timeStr = time.split('T')[1].substring(0, 5)
    }
    const [hour, minute] = timeStr.split(':')
    const hour24 = parseInt(hour)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 < 12 ? 'AM' : 'PM'
    return `${hour12}:${minute} ${ampm}`
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[80px]" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-6 w-[80px]" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and manage your service appointments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
            <CardDescription>
              All your service appointments and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isInitialLoading ? (
              <LoadingSkeleton />
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No bookings found.</p>
                <p className="text-sm mt-2">Start by booking a service!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">
                          {booking.partner?.serviceType ? 
                            (booking.partner.serviceType.charAt(0).toUpperCase() + booking.partner.serviceType.slice(1)) :
                            'Service Booking'
                          }
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.partner ? 
                            `with ${booking.partner.firstName} ${booking.partner.lastName}` :
                            'Partner TBD'
                          }
                        </p>
                        {booking.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {booking.description}
                          </p>
                        )}
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">
                          {booking.bookingDate ? 
                            formatDateForDisplay(booking.bookingDate) :
                            formatDateForDisplay(booking.startTime.split('T')[0])
                          }
                        </p>
                        <p className="text-muted-foreground">
                          {formatTimeForDisplay(booking.startTime)} - {formatTimeForDisplay(booking.endTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-medium">
                          {booking.totalAmount ? `$${booking.totalAmount}` : 'TBD'}
                        </span>
                        <p className="text-xs text-muted-foreground">
                          Booked {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={statusConfig[booking.status].variant}>
                        {statusConfig[booking.status].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}