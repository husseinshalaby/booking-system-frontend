"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

interface DashboardLayoutProps {
  children: React.ReactNode
  portalType?: 'partners' | 'customers'
}

interface LayoutProps {
  children: React.ReactNode
  portalType?: 'partners' | 'customers' | 'dashboard'
  currentUser?: any
}

export function DashboardLayout({ children, portalType }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const autoDetectedPortalType = pathname.startsWith('/customers') ? 'customers' : 'partners'
  const finalPortalType = (portalType as any) === 'dashboard' ? 'partners' : (portalType || autoDetectedPortalType)
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--header-height": "3rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar 
        variant="inset" 
        portalType={finalPortalType} 
        currentUser={session?.user as any || null}
      />
      <SidebarInset>
        <SiteHeader currentUser={session?.user as any || null} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function Layout({ children, portalType, currentUser }: LayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const autoDetectedPortalType = pathname.startsWith('/customers') ? 'customers' : 'partners'
  const finalPortalType = portalType || autoDetectedPortalType
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" portalType={finalPortalType as any} currentUser={currentUser || session?.user || null} />
      <SidebarInset>
        <SiteHeader currentUser={currentUser || session?.user || null} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}