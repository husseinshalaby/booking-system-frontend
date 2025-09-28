export interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  country?: string
  city?: string
}

export interface Partner {
  id: number
  firstName: string
  lastName: string
  email: string
  serviceType: string
  country?: string
  cities?: string[]
  hourlyRate?: number
}

export interface Booking {
  id: number
  customerId: number | null
  partnerId: number | null
  serviceType: string
  startTime: string
  endTime: string
  status: string
  description?: string
  totalAmount?: number
  createdAt: string
  updatedAt: string
  bookingDate?: string
  customer?: Customer | null
  partner?: Partner | null
}

export interface PartnerBooking {
  id: number
  customerId: number
  partnerId: number
  serviceType: string
  startTime: string
  endTime: string
  status: string
  description?: string
  totalAmount?: number
  createdAt: string
  updatedAt: string
  customer?: Customer
}

export interface CustomerBooking {
  id: number
  customerId: number
  partnerId: number
  bookingDate: string
  startTime: string
  endTime: string
  description: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  totalAmount?: number
  createdAt: string
  updatedAt: string
  partner: Partner
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'requested' | 'in_progress' | 'cancelled_failure' | 'cancelled_rejected'

export const statusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const },
  confirmed: { label: 'Confirmed', variant: 'default' as const },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const },
  completed: { label: 'Completed', variant: 'outline' as const },
  requested: { label: 'Requested', variant: 'secondary' as const },
  in_progress: { label: 'In Progress', variant: 'default' as const },
  cancelled_failure: { label: 'Cancelled', variant: 'destructive' as const },
  cancelled_rejected: { label: 'Rejected', variant: 'destructive' as const },
}

export const serviceTypeConfig = {
  painter: { label: 'Painter', color: 'bg-blue-100 text-blue-800', icon: '🎨' },
  electrician: { label: 'Electrician', color: 'bg-yellow-100 text-yellow-800', icon: '⚡' },
  plumber: { label: 'Plumber', color: 'bg-green-100 text-green-800', icon: '🔧' },
  cleaner: { label: 'Cleaner', color: 'bg-purple-100 text-purple-800', icon: '🧽' },
  handyman: { label: 'Handyman', color: 'bg-orange-100 text-orange-800', icon: '🔨' },
  hvac: { label: 'HVAC', color: 'bg-red-100 text-red-800', icon: '❄️' },
  landscaper: { label: 'Landscaper', color: 'bg-green-100 text-green-800', icon: '🌱' },
  roofer: { label: 'Roofer', color: 'bg-slate-100 text-slate-800', icon: '🏠' },
}