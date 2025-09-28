import { getSession } from "next-auth/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

async function authenticatedApiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const session = await getSession()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorMessage = 'Something went wrong. Please try again.'
      
      try {
        const errorData = await response.json()
        
        if (response.status === 401) {
          errorMessage = 'Please log in to continue'
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to perform this action'
        } else if (response.status === 404) {
          errorMessage = 'The requested service is not available'
        } else if (response.status === 500) {
          errorMessage = 'Service temporarily unavailable. Please try again in a moment.'
        } else if (errorData.message && !errorData.message.includes('HTTP') && !errorData.message.includes('Bearer')) {
          errorMessage = errorData.message
        }
      } catch (parseError) {
        if (response.status === 401) {
          errorMessage = 'Please log in to continue'
        }
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    
    if (data.success === false) {
      throw new Error(data.message || 'API request failed')
    }
    
    return data.data || data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Network request failed')
  }
}

export const authBookingsApi = {
  createBookingRequest: async (data: {
    startTime: string
    endTime: string
    country?: string
    serviceType?: string
  }) => {
    return authenticatedApiCall('/bookings/booking-request', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  confirmBookingRequest: async (data: {
    bookingRequestId: string
    partnerId: number
  }) => {
    return authenticatedApiCall('/bookings/booking-request/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getAll: async () => {
    return authenticatedApiCall('/bookings')
  },

  getByCustomer: async (customerId: number) => {
    return authenticatedApiCall(`/bookings?customerId=${customerId}`)
  },

  getByPartner: async (partnerId: number) => {
    return authenticatedApiCall(`/bookings?partnerId=${partnerId}`)
  },
}

export const authPartnersApi = {
  getAll: async (serviceType?: string) => {
    const query = serviceType ? `?serviceType=${serviceType}` : ''
    return authenticatedApiCall(`/partners${query}`)
  },
}