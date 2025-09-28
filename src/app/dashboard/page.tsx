"use client"

import { Layout } from "@/components/dashboard-layout"
import { useState, useEffect } from "react"
import Head from "next/head"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { statsApi } from "@/lib/api"

interface DashboardStats {
  totalCustomers: number
  totalPartners: number
  totalBookings: number
  totalAvailabilities: number
  recentBookings: Array<{
    id: number
    customerName: string
    partnerName: string
    serviceType: string
    status: string
    bookingDate: string
    createdAt: string
  }>
  activePartnersByService: Record<string, number>
  bookingsByStatus: Record<string, number>
}

export default function DashboardIndex() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const data = await statsApi.getDashboardStats() as DashboardStats
      
      setStats({
        totalCustomers: data.totalCustomers || 0,
        totalPartners: data.totalPartners || 0,
        totalBookings: data.totalBookings || 0,
        totalAvailabilities: data.totalAvailabilities || 0,
        recentBookings: data.recentBookings || [],
        activePartnersByService: data.activePartnersByService || {},
        bookingsByStatus: data.bookingsByStatus || {},
      })
    } catch (error) {
      setStats({
        totalCustomers: 0,
        totalPartners: 0,
        totalBookings: 0,
        totalAvailabilities: 0,
        recentBookings: [],
        activePartnersByService: {},
        bookingsByStatus: {},
      })
    } finally {
      setLoading(false)
    }
  }

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <Head>
        <title>Dashboard - Painter Booking Platform</title>
        <meta name="description" content="Platform administration dashboard" />
      </Head>
      
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and statistics</p>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Customers</CardDescription>
                    <CardTitle className="text-3xl">{stats?.totalCustomers || 0}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href="/dashboard/customers">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Partners</CardDescription>
                    <CardTitle className="text-3xl">{stats?.totalPartners || 0}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href="/dashboard/partners">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Bookings</CardDescription>
                    <CardTitle className="text-3xl">{stats?.totalBookings || 0}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href="/dashboard/bookings">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Available Slots</CardDescription>
                    <CardTitle className="text-3xl">{stats?.totalAvailabilities || 0}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link href="/dashboard/availability">
                      <Button variant="outline" size="sm">View All</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

            </div>
          )}
        </div>
      </Layout>
    </>
  )
}