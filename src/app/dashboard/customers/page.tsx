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
import { customerApi } from "@/lib/api"
import { useQueryParams } from "@/lib/hooks/useQueryParams"
import { countries } from "@/config/locations"

interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  country?: string
  city?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  bookings: Array<{
    id: number
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    bookingDate: string
    totalAmount?: number
  }>
}

function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  
  const {
    countries: selectedCountries,
    page,
    pageSize,
    setQueryParam,
    setQueryParams,
  } = useQueryParams({
    countries: "",
    page: "1",
    pageSize: "10",
  })

  const selectedCountryArray = useMemo(() => 
    selectedCountries ? selectedCountries.split(',').filter(Boolean) : [], 
    [selectedCountries]
  )

  const countryOptions = countries.map(country => ({
    label: `${country.flag} ${country.label}`,
    value: country.label,
  }))

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await customerApi.getAll() as Customer[]
      
      const filtered = data.filter(customer => {
        const matchesCountry = selectedCountryArray.length === 0 || 
          selectedCountryArray.includes(customer.country || '')

        return matchesCountry
      })
      
      setTotalCount(filtered.length)
      
      const startIndex = (Number(page) - 1) * Number(pageSize)
      const endIndex = startIndex + Number(pageSize)
      const paginatedData = filtered.slice(startIndex, endIndex)
      
      setCustomers(paginatedData)
    } catch (error) {
      let errorMessage = 'Failed to load customers data'
      
      if (error instanceof Error) {
        if (error.message?.includes('Authentication token required')) {
          errorMessage = 'Authentication error. Please check your login status.'
        } else if (error.message?.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        }
      }
      
      toast.error(errorMessage)
      setCustomers([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [selectedCountryArray, page, pageSize])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const filteredCustomers = customers

  const getCustomerStats = (customer: Customer) => {
    const totalBookings = customer.bookings?.length || 0
    const completedBookings = customer.bookings?.filter(b => b.status === 'completed').length || 0
    const totalSpent = customer.bookings?.reduce((sum, booking) => {
      const amount = Number(booking.totalAmount) || 0
      return sum + amount
    }, 0) || 0
    
    return { totalBookings, completedBookings, totalSpent: Number(totalSpent) }
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
        <title>Customers Management - Dashboard</title>
        <meta name="description" content="Manage all registered customers" />
      </Head>
      
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Customers</h1>
            <p className="text-muted-foreground">View and manage all registered customers</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Customers</CardTitle>
                    <CardDescription>
                      Manage customer accounts and view their activity
                    </CardDescription>
                  </div>
               
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">    
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
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          { selectedCountries ? 'No customers match your filters.' : 'No customers found.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => {
                        const stats = getCustomerStats(customer)
                        return (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">
                              #{customer.id}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {customer.firstName} {customer.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {customer.email}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm">{customer.email}</p>
                                {customer.phone && (
                                  <p className="text-sm text-muted-foreground">
                                    {customer.phone}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                {customer.country && (
                                  <p className="font-medium">{customer.country}</p>
                                )}
                                {customer.city && (
                                  <p className="text-sm text-muted-foreground">{customer.city}</p>
                                )}
                                {!customer.country && !customer.city && (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </div>
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
                              <span className="font-medium">
                                ${(stats.totalSpent || 0).toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={customer.isActive ? "default" : "secondary"}>
                                {customer.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(customer.createdAt).toLocaleDateString()}
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

export default function CustomersPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomersContent />
    </Suspense>
  )
}