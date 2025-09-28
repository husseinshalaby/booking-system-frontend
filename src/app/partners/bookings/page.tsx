"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { DashboardLayout } from "@/components/dashboard-layout"
import { bookingsApi } from "@/lib/api"
import { toast } from "sonner"
import { PartnerBooking, statusConfig, serviceTypeConfig } from "@/types/booking"

export default function BookingsPage() {
  const { data: session, status } = useSession()
  const [bookings, setBookings] = useState<PartnerBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPartnerBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!session?.user) {
        throw new Error('No user session found')
      }
      
      let partnerId = null
      if (session.user.id) {
        partnerId = parseInt(session.user.id)
      } else if ((session.user as any).userId) {
        partnerId = parseInt((session.user as any).userId)
      } else if ((session.user as any).partnerId) {
        partnerId = parseInt((session.user as any).partnerId)
      }
      
      if (!partnerId) {
        throw new Error('Partner ID not found in session. Please log in again.')
      }
      
      const fetchedBookings = await bookingsApi.getByPartner(partnerId)
      
      setBookings(Array.isArray(fetchedBookings) ? fetchedBookings : [])
    } catch (error) {
      
      let errorMessage = 'Failed to load your bookings'
      
      if (error instanceof Error) {
        if (error.message?.includes('Authentication token required')) {
          errorMessage = 'Authentication error. Please check your login status.'
        } else if (error.message?.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message?.includes('Partner ID not found')) {
          errorMessage = 'Please log in again to access your bookings.'
        }
      }
      
      toast.error(errorMessage)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status === 'unauthenticated') {
      window.location.href = '/partners/register'
      return
    }

    if (session && session.user.userType !== 'partner') {
      window.location.href = '/partners/register'
      return
    }
    
    if (session && session.user.userType === 'partner') {
      fetchPartnerBookings()
    }
  }, [session, status])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    let timeString = timeStr
    if (timeStr.includes('T')) {
      timeString = timeStr.split('T')[1].substring(0, 5)
    }
    
    const [hours, minutes] = timeString.split(':')
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes} ${ampm}`
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      ))}
    </div>
  )

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Bookings</h1>
            <p className="text-muted-foreground">View and manage all your assigned service jobs</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Bookings</CardTitle>
              <CardDescription>
                All service jobs that have been assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoadingSkeleton />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated' || (session && session.user.userType !== 'partner')) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Bookings</h1>
          <p className="text-muted-foreground">View and manage all your assigned service jobs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
            <CardDescription>
              All service jobs that have been assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bookings assigned to you yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          #{booking.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {booking.customer ? 
                                `${booking.customer.firstName} ${booking.customer.lastName}` :
                                `Customer #${booking.customerId}`
                              }
                            </p>
                            {booking.customer?.email && (
                              <p className="text-sm text-muted-foreground">
                                {booking.customer.email}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={serviceTypeConfig[booking.serviceType as keyof typeof serviceTypeConfig]?.color || 'bg-gray-100 text-gray-800'}>
                            {serviceTypeConfig[booking.serviceType as keyof typeof serviceTypeConfig]?.icon} {serviceTypeConfig[booking.serviceType as keyof typeof serviceTypeConfig]?.label || booking.serviceType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {booking.startTime.includes('T') ? 
                                formatDate(booking.startTime.split('T')[0]) :
                                'Date TBD'
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.startTime && booking.endTime ?
                                `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}` :
                                'Time TBD'
                              }
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.totalAmount ? (
                            <span className="font-medium">${booking.totalAmount}</span>
                          ) : (
                            <span className="text-muted-foreground">TBD</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[booking.status as keyof typeof statusConfig]?.variant || 'secondary'}>
                            {statusConfig[booking.status as keyof typeof statusConfig]?.label || booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}