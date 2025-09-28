"use client"

import { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import { Layout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { availabilityApi } from "@/lib/api"
import { useQueryParams } from "@/lib/hooks/useQueryParams"
import { countries } from "@/config/locations"

interface Availability {
  id: number
  partnerId: number
  startTime: string
  endTime: string
  isAvailable: boolean
  createdAt: string
  updatedAt: string
  partner: {
    id: number
    firstName: string
    lastName: string
    serviceType: string
    country: string
    cities: string[]
  }
}

const serviceTypeConfig = {
  painter: { label: 'Painter', color: 'bg-blue-100 text-blue-800', icon: '🎨' },
  electrician: { label: 'Electrician', color: 'bg-yellow-100 text-yellow-800', icon: '⚡' },
  plumber: { label: 'Plumber', color: 'bg-green-100 text-green-800', icon: '🔧' },
  cleaner: { label: 'Cleaner', color: 'bg-purple-100 text-purple-800', icon: '🧽' },
  handyman: { label: 'Handyman', color: 'bg-orange-100 text-orange-800', icon: '🔨' },
  hvac: { label: 'HVAC', color: 'bg-red-100 text-red-800', icon: '❄️' },
  landscaper: { label: 'Landscaper', color: 'bg-green-100 text-green-800', icon: '🌱' },
  roofer: { label: 'Roofer', color: 'bg-slate-100 text-slate-800', icon: '🏠' },
}

function AvailabilityContent() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
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

  const fetchAvailabilities = useCallback(async () => {
    try {
      setLoading(true)
      const data = await availabilityApi.getAll() as Availability[]
      
      const filtered = data.filter((availability: Availability) => {
        const matchesService = selectedServiceArray.length === 0 || 
          selectedServiceArray.includes(availability.partner.serviceType)

        const matchesCountry = selectedCountryArray.length === 0 || 
          selectedCountryArray.includes(availability.partner.country || '')

        return matchesService && matchesCountry
      })
      
      setTotalCount(filtered.length)
      
      const startIndex = (Number(page) - 1) * Number(pageSize)
      const endIndex = startIndex + Number(pageSize)
      const paginatedData = filtered.slice(startIndex, endIndex)
      
      setAvailabilities(paginatedData)
    } catch (error) {
      let errorMessage = 'Failed to load availability data'
      
      if (error instanceof Error) {
        if (error.message?.includes('Authentication token required')) {
          errorMessage = 'Authentication error. Please check your login status.'
        } else if (error.message?.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        }
      }
      
      toast.error(errorMessage)
      setAvailabilities([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [selectedServiceArray, selectedCountryArray, page, pageSize])

  useEffect(() => {
    fetchAvailabilities()
  }, [fetchAvailabilities])

  const filteredAvailabilities = availabilities

  const serviceOptions = Object.entries(serviceTypeConfig).map(([value, config]) => ({
    label: `${config.icon} ${config.label}`,
    value,
  }))
  
  const countryOptions = countries.map(country => ({
    label: `${country.flag} ${country.label}`,
    value: country.label,
  }))

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No date'
    
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'No time'
    
    let date: Date
    if (timeStr.includes('T') || timeStr.includes('-')) {
      date = new Date(timeStr)
    } else {
      date = new Date(`1970-01-01T${timeStr}`)
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid time'
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getAvailabilityStatus = (availability: Availability) => {
    const startDate = new Date(availability.startTime)
    const now = new Date()

    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    if (startDateOnly < nowDateOnly) {
      return { 
        label: 'Expired', 
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-600'
      }
    }
    
    if (availability.isAvailable) {
      return { 
        label: 'Available', 
        variant: 'default' as const,
        className: ''
      }
    } else {
      return { 
        label: 'Booked', 
        variant: 'destructive' as const,
        className: ''
      }
    }
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      ))}
    </div>
  )

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Availability</h1>
          <p className="text-muted-foreground">View and manage all partner availability slots</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Availability Slots</CardTitle>
                  <CardDescription>
                    All partner availability slots across the platform
                  </CardDescription>
                </div>
              
              </div>
              
              
              <div className="flex flex-wrap items-center gap-4">

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
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAvailabilities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        { services || selectedCountries ? 'No availability slots match your filters.' : 'No availability slots found.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAvailabilities.map((availability) => (
                      <TableRow key={availability.id}>
                        <TableCell className="font-medium">
                          #{availability.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {availability.partner.firstName} {availability.partner.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Partner #{availability.partnerId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={serviceTypeConfig[availability.partner.serviceType as keyof typeof serviceTypeConfig]?.color || 'bg-gray-100 text-gray-800'}>
                            {serviceTypeConfig[availability.partner.serviceType as keyof typeof serviceTypeConfig]?.icon} {serviceTypeConfig[availability.partner.serviceType as keyof typeof serviceTypeConfig]?.label || availability.partner.serviceType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{availability.partner.country}</p>
                            {availability.partner.cities && availability.partner.cities.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                {availability.partner.cities.join(', ')}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatDate(availability.startTime)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const status = getAvailabilityStatus(availability)
                            return (
                              <Badge 
                                variant={status.variant}
                                className={status.className}
                              >
                                {status.label}
                              </Badge>
                            )
                          })()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(availability.createdAt).toLocaleDateString()}
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
  )
}

export default function AvailabilityPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AvailabilityContent />
    </Suspense>
  )
}