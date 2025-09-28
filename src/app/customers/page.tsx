import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Adam - Customer Dashboard",
  description: "Customer dashboard to browse services and manage bookings.",
}

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Customer Portal</h1>
          <p className="text-muted-foreground">
            Use the sidebar to navigate between booking services and viewing your orders
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Book a Service</h2>
            <p className="text-muted-foreground mb-4">
              Choose from various services and book an appointment
            </p>
            <Link 
              href="/customers/book-service" 
              className="text-blue-600 hover:underline"
            >
              Book Service →
            </Link>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">My Orders</h2>
            <p className="text-muted-foreground mb-4">
              View and manage your service appointments
            </p>
            <Link 
              href="/customers/my-orders" 
              className="text-blue-600 hover:underline"
            >
              View Orders →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}