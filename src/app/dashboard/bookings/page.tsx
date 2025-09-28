"use client"

import { Layout } from "@/components/dashboard-layout"
import { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import Head from "next/head"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { toast } from "sonner"
import { bookingsApi } from "@/lib/api"
import { useQueryParams } from "@/lib/hooks/useQueryParams"
import { countries } from "@/config/locations"
import { Booking, statusConfig, serviceTypeConfig } from "@/types/booking"

function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const {
    services,
    countries: selectedCountries,
    page,
    pageSize,
    setQueryParam,
    setQueryParams,
  } = useQueryParams({
    services: "",
    countries: "",
    page: "1",
    pageSize: "10",
  })

  const selectedServiceArray = useMemo(() => 
    services ? services.split(',').filter(Boolean) : [], 
    [services]
  )
  const selectedCountryArray = useMemo(() => 
    selectedCountries ? selectedCountries.split(',').filter(Boolean) : [], 
    [selectedCountries]
  )

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await bookingsApi.getAll() as Booking[]
      
      const filtered = data.filter((booking: Booking) => {
        const serviceType = booking.partner?.serviceType || booking.serviceType
        const matchesService = selectedServiceArray.length === 0 || 
          (serviceType && selectedServiceArray.includes(serviceType))

        const matchesCountry = selectedCountryArray.length === 0 || 
          selectedCountryArray.includes(booking.customer?.country || '') ||
          selectedCountryArray.includes(booking.partner?.country || '')

        return matchesService && matchesCountry
      })
      
      setTotalCount(filtered.length)
      
      const startIndex = (Number(page) - 1) * Number(pageSize)
      const endIndex = startIndex + Number(pageSize)
      const paginatedData = filtered.slice(startIndex, endIndex)
      
      setBookings(paginatedData)
    } catch (error) {
      let errorMessage = 'Failed to load bookings data'
      
      if (error instanceof Error) {
        if (error.message?.includes('Authentication token required')) {
          errorMessage = 'Authentication error. Please check your login status.'
        } else if (error.message?.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        }
      }
      
      toast.error(errorMessage)
      setBookings([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [selectedServiceArray, selectedCountryArray, page, pageSize])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const filteredBookings = bookings

  const serviceOptions = Object.entries(serviceTypeConfig).map(([value, config]) => ({
    label: `${config.icon} ${config.label}`,
    value,
  }))
  
  const countryOptions = countries.map(country => ({
    label: `${country.flag} ${country.label}`,
    value: country.label,
  }))

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':')
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes} ${ampm}`
  }

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      await bookingsApi.updateStatus(bookingId, newStatus)
      
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ))
      
      toast.success(`Booking ${newStatus} successfully`)
    } catch (error) {
      let errorMessage = 'Failed to update booking status'
      
      if (error instanceof Error) {
        if (error.message?.includes('Authentication token required')) {
          errorMessage = 'Authentication error. Please try again.'
        } else if (error.message?.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please try again.'
        }
      }
      
      toast.error(errorMessage)
    }
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

  return (
    <>
      <Head>
        <title>Bookings Management - Dashboard</title>
        <meta name="description" content="Manage all bookings and appointments" />
      </Head>
      
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Bookings</h1>
            <p className="text-muted-foreground">View and manage all bookings and appointments</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Bookings</CardTitle>
                    <CardDescription>
                      Manage customer bookings and partner appointments
                    </CardDescription>
                  </div>
              
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2"> 
                    <DataTableFacetedFilter
                      title="Services"
                      options={serviceOptions}
                      selectedValues={selectedServiceArray}
                      onChange={(values) => setQueryParam('services')(values.join(','))}
                      searchPlaceholder="Search services..."
                      maxSelections={8}
                    />
                    
                    <DataTableFacetedFilter
                      title="Country"
                      options={countryOptions}
                      selectedValues={selectedCountryArray}
                      onChange={(values) => setQueryParam('countries')(values.join(','))}
                      searchPlaceholder="Search countries..."
                      maxSelections={5}
                    />
                  </div>

                </div>
              </div>
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
                      <TableHead>Partner</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          { services || selectedCountries ? 'No bookings match your filters.' : 'No bookings found.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            #{booking.id}
                          </TableCell>
                          <TableCell>
                            <div>
                              {booking.customer ? (
                                <>
                                  <p className="font-medium">
                                    {booking.customer.firstName} {booking.customer.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {booking.customer.email}
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  Customer ID: {booking.customerId}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {booking.partner ? (
                                <>
                                  <p className="font-medium">
                                    {booking.partner.firstName} {booking.partner.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {booking.partner.email}
                                  </p>
                                </>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  No partner assigned
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const serviceType = booking.partner?.serviceType || booking.serviceType
                              const config = serviceType ? serviceTypeConfig[serviceType as keyof typeof serviceTypeConfig] : null
                              return (
                                <Badge variant="secondary" className={config?.color || 'bg-gray-100 text-gray-800'}>
                                  {config?.icon} {config?.label || serviceType || 'Unknown Service'}
                                </Badge>
                              )
                            })()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{booking.bookingDate ? formatDate(booking.bookingDate) : 'No date'}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {booking.totalAmount ? (
                              <span className="font-medium">${booking.totalAmount}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
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
              
              {!loading && totalCount > 0 && (
                <div className="mt-4">
                  <DataTablePagination
                    totalItems={totalCount}
                    currentPage={Number(page)}
                    pageSize={Number(pageSize)}
                    totalPages={Math.ceil(totalCount / Number(pageSize))}
                    onPageChange={(newPage) => setQueryParam('page')(newPage.toString())}
                    onPageSizeChange={(newPageSize) => {
                      setQueryParams({
                        pageSize: newPageSize.toString(),
                        page: "1", 
                      })
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  )
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingsContent />
    </Suspense>
  )
}