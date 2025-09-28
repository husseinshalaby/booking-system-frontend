"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  IconChartBar,
  IconListDetails,
  IconReport,
  IconUsers,
  IconDashboard,
  IconCalendar,
  IconBookmark,
  IconUserCheck,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  dashboardNav: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Availability",
      url: "/dashboard/availability",
      icon: IconCalendar,
    },
    {
      title: "Bookings",
      url: "/dashboard/bookings",
      icon: IconBookmark,
    },
    {
      title: "Customers",
      url: "/dashboard/customers",
      icon: IconUsers,
    },
    {
      title: "Partners",
      url: "/dashboard/partners",
      icon: IconUserCheck,
    },
  ],
  partnersNav: [

    {
      title: "Availability",
      url: "/partners/availability",
      icon: IconListDetails,
    },
    {
      title: "Bookings",
      url: "/partners/bookings",
      icon: IconChartBar,
    },
  ],
  customersNav: [

    {
      title: "Book Service",
      url: "/customers/book-service",
      icon: IconUsers,
    },
    {
      title: "My Bookings",
      url: "/customers/my-bookings",
      icon: IconReport,
    },
  ],

}

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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  portalType?: 'partners' | 'customers'
  currentUser?: User | null
}

export function AppSidebar({ portalType = 'partners', currentUser, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  const isDashboard = pathname.startsWith('/dashboard')

  let navItems = data.partnersNav
  let portalTitle = 'Partner Portal'
  
  if (isDashboard) {
    navItems = data.dashboardNav
    portalTitle = 'Admin Dashboard'
  } else if (portalType === 'customers') {
    navItems = data.customersNav
    portalTitle = 'Customer Portal'
  }

  const user = currentUser ? {
    name: `${currentUser.firstName} ${currentUser.lastName}`,
    email: currentUser.email,
    avatar: currentUser.photo || `/avatars/${currentUser.firstName.toLowerCase()}.jpg`
  } : data.user
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Image src="/faviconV2.png" alt="Favicon" width={20} height={20} className="!size-5" />
                <span className="text-base font-semibold">
                  {portalTitle}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      {!isDashboard && (
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
