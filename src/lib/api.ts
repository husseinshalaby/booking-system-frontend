
const getApiBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

  if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    return `https://${apiUrl}`;
  }
  
  return apiUrl;
};

const API_BASE_URL = getApiBaseUrl();

let ACCESS_TOKEN: string | null = null;

export const setAuthToken = (token: string) => {
  ACCESS_TOKEN = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', token);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  return null;
};

export const clearAuthToken = () => {
  ACCESS_TOKEN = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

export const getUserType = (): 'customer' | 'partner' | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userType') as 'customer' | 'partner' | null;
  }
  return null;
};

export const combineDateAndTime = (date: string, time: string): string => {
  return `${date}T${time}:00`;
};

export const extractDate = (datetime: string): string => {
  return datetime.split('T')[0];
};

export const extractTime = (datetime: string): string => {
  return datetime.split('T')[1].substring(0, 5);
};

async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (!endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
    if (typeof window !== 'undefined') {
      try {
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        
        if (session?.user) {
          headers['x-user-id'] = session.user.id;
          headers['x-user-type'] = session.user.userType;
          headers['x-user-email'] = session.user.email || '';
        }
      } catch (error) {
      }
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        
        if (errorData.success === false) {
          errorMessage = errorData.message || errorMessage;
        } else if (errorData.error && errorData.suggestion) {
          const error = new Error(errorData.error);
          (error as any).suggestion = errorData.suggestion;
          throw error;
        } else {
          errorMessage = errorData.message || errorMessage;
        }
      } catch (parseError) {
      }

      if (errorMessage.includes('Authentication token required') || errorMessage.includes('Unauthorized')) {
        throw new Error('Please log in to continue');
      }
      
      throw new Error(errorMessage);
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      throw new Error('Failed to parse server response');
    }
    
    if (responseData.success === false) {
      throw new Error(responseData.message || 'API request failed');
    }
    
    return responseData.data || responseData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

export const customerApi = {
  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    country?: string;
    city?: string;
  }) => {
    return apiCall('/auth/register/customer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getById: async (id: number) => {
    return apiCall(`/customers/${id}`);
  },

  getAll: async () => {
    return apiCall('/customers');
  },

  update: async (id: number, data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    address: string;
  }>) => {
    return apiCall(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

export const authApi = {
  validate: async () => {
    return apiCall('/auth/validate');
  },

  me: async () => {
    return apiCall('/auth/me');
  },

  login: async (email: string, password: string) => {
    const response = await apiCall<{
      access_token: string;
      refresh_token: string;
      expires_in: number;
      user: any;
      userType: 'customer' | 'partner';
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.access_token) {
      setAuthToken(response.access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('userType', response.userType);
      }
    }

    return response;
  },

  registerCustomer: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    countryCode?: string;
    country?: string;
    city?: string;
  }) => {
    return apiCall('/auth/register/customer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  registerPartner: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    countryCode?: string;
    country?: string;
    city?: string;
    serviceType: string;
    description?: string;
    hourlyRate?: number;
  }) => {
    return apiCall('/auth/register/partner', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logout: async () => {
    clearAuthToken();
    return { success: true };
  },
};

export const partnersApi = {
  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    serviceType: 'painter' | 'electrician' | 'plumber' | 'cleaner';
    description?: string;
    hourlyRate?: number;
  }) => {
    return apiCall('/partners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async (serviceType?: string) => {
    const query = serviceType ? `?serviceType=${serviceType}` : '';
    return apiCall(`/partners${query}`);
  },

  getById: async (id: number) => {
    return apiCall(`/partners/${id}`);
  },

  getServices: async () => {
    return apiCall('/partners/services');
  },
};

export const bookingsApi = {
  create: async (data: {
    customerId: number;
    partnerId: number;
    startTime: string; 
    endTime: string;  
    description?: string;
    totalAmount?: number;
  }) => {
    return apiCall('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  createBookingRequest: async (data: {
    startTime: string; 
    endTime: string;  
    country?: string;
    city?: string;
    serviceType?: string;
  }) => {
    return apiCall('/bookings/booking-request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  confirmBookingRequest: async (data: {
    bookingRequestId: string;
    partnerId: number;
  }) => {
    return apiCall('/bookings/booking-request/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async () => {
    return apiCall('/bookings');
  },

  getByCustomer: async (customerId: number) => {
    return apiCall(`/bookings?customerId=${customerId}`);
  },

  getByPartner: async (partnerId: number) => {
    return apiCall(`/bookings?partnerId=${partnerId}`);
  },

  updateStatus: async (id: number, status: string) => {
    return apiCall(`/bookings/${id}/status/${status}`, {
      method: 'PATCH',
    });
  },
};

export const availabilityApi = {
  create: async (data: {
    partnerId: number;
    startTime: string;
    endTime: string; 
  }) => {
    return apiCall('/availability', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAll: async () => {
    return apiCall('/availability');
  },

  getByPartner: async (partnerId: number) => {
    return apiCall(`/availability?partnerId=${partnerId}`);
  },

  getAvailableSlots: async (partnerId: number, date: string) => {
    return apiCall(`/availability/partner/${partnerId}/date/${date}`);
  },

  delete: async (id: number) => {
    return apiCall(`/availability/${id}`, {
      method: 'DELETE',
    });
  },
};

export const statsApi = {
  getCounts: () => apiCall('/stats/counts'),
  getDashboardStats: () => apiCall('/stats'),
};
if (typeof window !== 'undefined') {
  const storedToken = localStorage.getItem('access_token');
  if (storedToken) {
    ACCESS_TOKEN = storedToken;
  }
}