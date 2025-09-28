"use client"

import React from "react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ModeToggle } from "@/components/mode-toggle"
import { CountryFlag } from "@/components/country-flag"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  userType: 'customer' | 'partner'
  phone?: string
  photo?: string
  country?: string
  cities?: string[]
  serviceType?: string
  hourlyRate?: number
}

interface SiteHeaderProps {
  currentUser?: User | null
}

export function SiteHeader({ currentUser }: SiteHeaderProps) {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith('/dashboard')

  const generateBreadcrumb = () => {
    const path = pathname
    
    if (path === '/dashboard') {
      return [{ label: 'Dashboard', href: '/dashboard', isActive: true }]
    }
    
    if (path.startsWith('/dashboard')) {
      const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard', isActive: false }]
      
      if (path.includes('/dashboard/availability')) {
        breadcrumbs.push({ label: 'Availability', href: '/dashboard/availability', isActive: true })
      } else if (path.includes('/dashboard/bookings')) {
        breadcrumbs.push({ label: 'Bookings', href: '/dashboard/bookings', isActive: true })
      } else if (path.includes('/dashboard/customers')) {
        breadcrumbs.push({ label: 'Customers', href: '/dashboard/customers', isActive: true })
      } else if (path.includes('/dashboard/partners')) {
        breadcrumbs.push({ label: 'Partners', href: '/dashboard/partners', isActive: true })
      } else {
        breadcrumbs[0].isActive = true
      }
      
      return breadcrumbs
    }
    
    if (path.startsWith('/partners')) {
      const breadcrumbs = [{ label: 'Partners', href: '/partners', isActive: false }]
      
      if (path.includes('availability')) {
        breadcrumbs.push({ label: 'Availability', href: '/partners/availability', isActive: true })
      } else if (path.includes('bookings')) {
        breadcrumbs.push({ label: 'Bookings', href: '/partners/bookings', isActive: true })
      } else {
        breadcrumbs[0].isActive = true
      }
      
      return breadcrumbs
    }
    
    if (path.startsWith('/customers')) {
      const breadcrumbs = [{ label: 'Customers', href: '/customers', isActive: false }]
      
      if (path.includes('book-service')) {
        breadcrumbs.push({ label: 'Book Service', href: '/customers/book-service', isActive: true })
      } else if (path.includes('my-orders') || path.includes('my-bookings')) {
        breadcrumbs.push({ label: 'My Bookings', href: '/customers/my-bookings', isActive: true })
      } else {
        breadcrumbs[0].isActive = true
      }
      
      return breadcrumbs
    }

    return [{ label: 'Home', href: '/', isActive: true }]
  }
  
  const breadcrumbs = generateBreadcrumb()
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {crumb.isActive ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-3">
          {!isDashboard && (
            <CountryFlag 
              country={currentUser?.country} 
              className="hover:scale-110 transition-transform cursor-default" 
            />
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
