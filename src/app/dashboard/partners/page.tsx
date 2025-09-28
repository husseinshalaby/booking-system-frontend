"use client"
import { Layout } from "@/components/dashboard-layout"
import { useState, useEffect, useCallback, useMemo, Suspense } from "react"
import Head from "next/head"
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
import { partnersApi } from "@/lib/api"
import { useQueryParams } from "@/lib/hooks/useQueryParams"
import { countries } from "@/config/locations"

interface Partner {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  photo?: string
  country?: string
  cities?: string[]
  serviceType: string
  description?: string
  hourlyRate?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  availabilities: Array<{
    id: number
    date: string
    startTime: string
    endTime: string
    isAvailable: boolean
  }>
  bookings: Array<{
    id: number
    status: string
    bookingDate: string
    totalAmount?: number
  }>
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

function PartnersContent() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [lastErrorMessage, setLastErrorMessage] = useState<string>('')
  
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

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true)
      const data = await partnersApi.getAll() as Partner[]
      
      const filtered = data.filter((partner: Partner) => {
        const matchesService = selectedServiceArray.length === 0 || 
          selectedServiceArray.includes(partner.serviceType)
          
        const matchesCountry = selectedCountryArray.length === 0 || 
          selectedCountryArray.includes(partner.country || '')

        return matchesService && matchesCountry
      })
      
      setTotalCount(filtered.length)
      
      const startIndex = (Number(page) - 1) * Number(pageSize)
      const endIndex = startIndex + Number(pageSize)
      const paginatedData = filtered.slice(startIndex, endIndex)
      
      setPartners(paginatedData)
    } catch (error: unknown) {
      let errorMessage = 'Failed to load partners data'
      
      if (error instanceof Error) {
        if (error.message?.includes('Authentication token required')) {
          errorMessage = 'Authentication error. Please check your login status.'
        } else if (error.message?.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        }
      }
      
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const statusError = error as { status: number }
        if (statusError.status === 404) {
          errorMessage = 'Partners service not found. Please contact support.'
        } else if (statusError.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      }
      
      if (errorMessage !== lastErrorMessage) {
        toast.error(errorMessage)
        setLastErrorMessage(errorMessage)
      }
      setPartners([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [selectedServiceArray, selectedCountryArray, page, pageSize, lastErrorMessage])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const filteredPartners = partners

  const serviceOptions = Object.entries(serviceTypeConfig).map(([value, config]) => ({
    label: `${config.icon} ${config.label}`,
    value,
  }))
  
  const countryOptions = countries.map(country => ({
    label: `${country.flag} ${country.label}`,
    value: country.label,
  }))

  const getPartnerStats = (partner: Partner) => {
    const totalBookings = partner.bookings?.length || 0
    const completedBookings = partner.bookings?.filter(b => b.status === 'completed').length || 0
    const totalEarnings = partner.bookings?.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0) || 0
    const availableSlots = partner.availabilities?.filter(a => a.isAvailable).length || 0
    
    return { totalBookings, completedBookings, totalEarnings, availableSlots }
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[80px]" />
        </div>
      ))}
    </div>
  )

  return (
    <>
      <Head>
        <title>Partners Management - Dashboard</title>
        <meta name="description" content="Manage all service partners" />
      </Head>
      
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Partners</h1>
            <p className="text-muted-foreground">View and manage all service partners</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Partners</CardTitle>
                    <CardDescription>
                      Manage partner accounts and view their performance
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
                      <TableHead>Partner ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Available Slots</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPartners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                          { services || selectedCountries ? 'No partners match your filters.' : 'No partners found.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPartners.map((partner) => {
                        const stats = getPartnerStats(partner)
                        const serviceConfig = serviceTypeConfig[partner.serviceType as keyof typeof serviceTypeConfig] || 
                          { label: partner.serviceType, color: 'bg-gray-100 text-gray-800' }
                        
                        return (
                          <TableRow key={partner.id}>
                            <TableCell className="font-medium">
                              #{partner.id}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {partner.firstName} {partner.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {partner.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                {partner.phone ? (
                                  <p className="text-sm">{partner.phone}</p>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={serviceConfig.color}>
                                {serviceConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                {partner.country && (
                                  <p className="font-medium">{partner.country}</p>
                                )}
                                {partner.cities && partner.cities.length > 0 && (
                                  <p className="text-sm text-muted-foreground">
                                    {partner.cities.slice(0, 2).join(', ')}
                                    {partner.cities.length > 2 && ` +${partner.cities.length - 2}`}
                                  </p>
                                )}
                                {!partner.country && (!partner.cities || partner.cities.length === 0) && (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {partner.hourlyRate ? (
                                <span className="font-medium">${partner.hourlyRate}/hr</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{stats.totalBookings} total</p>
                                <p className="text-sm text-muted-foreground">
                                  {stats.completedBookings} completed
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {stats.availableSlots} slots
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={partner.isActive ? "default" : "secondary"}>
                                {partner.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(partner.createdAt).toLocaleDateString()}
                            </TableCell>
                          
                          </TableRow>
                        )
                      })
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

export default function PartnersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PartnersContent />
    </Suspense>
  )
}