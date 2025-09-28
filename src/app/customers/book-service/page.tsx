"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Layout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { partnersApi, bookingsApi } from "@/lib/api"
import { professions } from "@/config/professions"
import { serviceTypeConfig } from "@/types/booking"
import { countries, getCitiesByCountry } from "@/config/locations"
import { toast } from "sonner"

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  priceRange: string;
  minRate: number;
  maxRate: number;
  count: number;
}

interface AvailableMatch {
  partnerId: number;
  partnerName: string;
  country: string;
  city: string;
  exactMatch: boolean;
}

interface NearestSlot {
  startTime: string;
  endTime: string;
  partnerId: number;
  partnerName: string;
  country: string;
  city: string;
}

interface BookingResponse {
  uuid: string;
  status: string;
  nearestAvailabilities: {
    startTime: string;
    endTime: string;
    partnerId: number;
    partnerName: string;
  }[];
  bookingObject?: {
    id: number;
    uuid: string;
    customerId: number;
    partnerId: number;
    serviceType: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: string;
    description: string;
    totalAmount: number | null;
    createdAt: string;
    updatedAt: string;
  };
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  partnerId: number;
  partnerName: string;
  available: boolean;
}

const generateTimeSlots = (selectedDate: Date): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDate.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  for (let displayHour = 0; displayHour < 24; displayHour++) {
    const startHourStr = String(displayHour).padStart(2, '0');
    const endHourStr = String(displayHour + 1).padStart(2, '0');
    const startTime = `${dateStr}T${startHourStr}:00:00.000Z`;
    const endTime = `${dateStr}T${endHourStr}:00:00.000Z`;
    
    slots.push({
      startTime,
      endTime,
      partnerId: -1,
      partnerName: "Select this time",
      available: true
    });
  }
  
  return slots;
};

export default function BookServicePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [partnerCounts, setPartnerCounts] = useState<Record<string, number>>({})
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null)
  const [showResults, setShowResults] = useState(false)

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const formatDateForDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  useEffect(() => {
    if (status === 'loading') return
    
    if (status === 'unauthenticated') {
      toast.error('Please log in to book services')
      router.push('/customers/login')
      return
    }
    
    if (session && session.user.userType !== 'customer') {
      toast.error('Only customers can book services')
      router.push('/customers/login')
      return
    }
    
    if (session && session.user.userType === 'customer') {
      loadServices()
      if (session.user.country) {
        const getCountryCode = (country: string) => {
          const countryToCode: Record<string, string> = {
            'AUSTRALIA': 'au',
            'UNITED KINGDOM': 'gb', 
            'UNITED STATES': 'us',
            'CANADA': 'ca',
            'AUSTRIA': 'at',
            'GERMANY': 'de',
            'FRANCE': 'fr',
          }
          return countryToCode[country.toUpperCase()] || ''
        }
        setSelectedCountry(getCountryCode(session.user.country))
      }
    }
  }, [session, status, router]);

  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(selectedDate);
      setAvailableSlots(slots);
      setSelectedSlot(null);
    } else {
      setAvailableSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDate]);

  const loadServices = async () => {
    setServicesLoading(true);
    
    const counts: Record<string, number> = {};
    
    professions.forEach(profession => {
      counts[profession.value] = 0;
    });
    
    try {
      const partnersData = await partnersApi.getAll();
      
      if (Array.isArray(partnersData)) {
        professions.forEach(profession => {
          const count = partnersData.filter((partner: { serviceType: string }) => 
            partner.serviceType === profession.value
          ).length;
          counts[profession.value] = count;
        });
      }
      
      setPartnerCounts(counts);
    } catch (error) {
      setPartnerCounts(counts);
    }
    
    const servicesData: Service[] = professions.map(profession => {
      const config = serviceTypeConfig[profession.value as keyof typeof serviceTypeConfig];
      const count = counts[profession.value] || 0;
      
      return {
        id: profession.value,
        name: profession.label,
        description: profession.description,
        icon: config?.icon || '🔧',
        priceRange: '$25-100/hr',
        minRate: 25,
        maxRate: 100,
        count: count
      };
    });
    
    setServices(servicesData);
    setServicesLoading(false);
  };

  const handleRequestService = async () => {
    
    if (!selectedSlot || !selectedService || !selectedDate) {
      return;
    }
    
    if (!session || !session.user) {
      toast.error('Please log in to book services')
      router.push('/customers/login')
      return
    }
    
    try {
      setBookingLoading(true);
      
      const response = await bookingsApi.createBookingRequest({
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        country: selectedCountry,
        serviceType: selectedService || undefined,
      }) as BookingResponse;
      
      setBookingResponse(response);
      setShowResults(true);
      
      console.log('🔍 Booking Response Debug:', {
        status: response.status,
        availabilitiesLength: response.nearestAvailabilities?.length,
        availabilities: response.nearestAvailabilities
      });
      
      if (response.status === 'confirmed' && response.nearestAvailabilities?.length > 0) {
        toast.success('🎉 Perfect match! Your booking is confirmed and ready to complete.', { duration: 5000 });
      } else if (response.status === 'pending' && response.nearestAvailabilities?.length > 0) {
        toast.info(`No exact match for your time, but found ${response.nearestAvailabilities.length} alternative time slot${response.nearestAvailabilities.length > 1 ? 's' : ''}.`);
      } else if (response.nearestAvailabilities?.length > 0) {
        toast.success(`Found ${response.nearestAvailabilities.length} available provider(s) for your selected time slot.`);
      } else {
        toast.warning('No providers available for the selected time slot.');
      }
      
    } catch (error: unknown) {
      setBookingResponse(null);
      setShowResults(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Internal server error')) {
        toast.error('⚠️ Service temporarily unavailable. Please try again in a moment.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('🌐 Network error. Please check your connection and try again.');
      } else if (errorMessage.includes('timeout')) {
        toast.error('⏰ Request timed out. Please try again.');
      } else {
        toast.error(errorMessage || '❌ Booking request failed. Please try selecting a different time slot.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const confirmBooking = async (partnerId: number) => {
    if (!bookingResponse) return;
    
    try {
      setBookingLoading(true);
      
      // If booking is already confirmed, no need to call API again
      if (bookingResponse.status === 'confirmed') {
        const partnerName = bookingResponse.nearestAvailabilities.find(a => a.partnerId === partnerId)?.partnerName || 'the service provider';
        
        toast.success(
          `🎉 Booking confirmed! You're all set with ${partnerName}. You'll receive a confirmation email shortly.`,
          { duration: 7000 }
        );
        
        // Reset the booking response state so user can book again
        setBookingResponse(null);
        setShowResults(false);
        return;
      }
      
      console.log('🔍 Confirming booking with:', {
        bookingRequestId: bookingResponse.uuid,
        partnerId,
        fullBookingResponse: bookingResponse
      });
      
      const booking = await bookingsApi.confirmBookingRequest({
        bookingRequestId: bookingResponse.uuid,
        partnerId,
      }) as { painter: { name: string } };
      
      toast.success(
        `🎉 Booking confirmed! You're all set with ${booking.painter.name}. You'll receive a confirmation email shortly.`,
        { duration: 7000 }
      );
      
      // Reset the booking response state so user can book again
      setBookingResponse(null);
      setShowResults(false);
      
    } catch (error: unknown) {
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Partner is no longer available')) {
        toast.error('😔 This painter is no longer available at the selected time. Please choose another painter or time slot.');
      } else if (errorMessage.includes('already been booked')) {
        toast.error('⚠️ This time slot was just booked by someone else. Please select a different painter or time.');
      } else if (errorMessage.includes('expired')) {
        // toast.error('⏰ Your booking request has expired. Please start over with a new booking request.');
        // resetForm();
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('🌐 Network error. Please check your connection and try again.');
      } else {
        toast.error(`❌ Failed to confirm booking: ${errorMessage || 'Please try selecting a different painter or time slot.'}`);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSlot(null);
    setSelectedDate(undefined);
    setSelectedService(null);
    setAvailableSlots([]);
    setBookingResponse(null);
    setShowResults(false);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book a Service</h1>
        <p className="text-muted-foreground">Choose a service and book an appointment</p>
      </div>

      {!selectedService ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="text-center">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto mb-2" />
                  <Skeleton className="h-6 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </CardHeader>
                <CardContent className="text-center">
                  <Skeleton className="h-6 w-20 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : services.length > 0 ? (
            services.map((service) => (
              <Card 
                key={service.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedService(service.id)}
              >
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{service.icon}</div>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription className="text-center">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary">{service.priceRange}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {partnerCounts[service.id] || 0} provider{(partnerCounts[service.id] || 0) !== 1 ? 's' : ''} available
                  </p>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No services available at the moment.</p>
              <Button 
                variant="outline" 
                onClick={loadServices}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedService(null)
                setSelectedDate(undefined)
                setSelectedSlot(null)
                setAvailableSlots([])
                setBookingResponse(null)
                setShowResults(false)
              }}
            >
              ← Back to Services
            </Button>
            <div>
              <h2 className="text-2xl font-bold">
                Book {services.find(s => s.id === selectedService)?.name}
              </h2>
              <p className="text-muted-foreground">
                Select a date and time slot, then request service
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                  <CardDescription>
                    Choose a date to see available time slots
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-lg border shadow-sm"
                    disabled={(date) => date < new Date()}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate 
                      ? `Select Time - ${selectedDate.toLocaleDateString()}`
                      : "Select a date first"
                    }
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred time slot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedDate ? (
                    <div className="space-y-3">
                      {availableSlots.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                          {availableSlots.map((slot) => {
                            const hour = new Date(slot.startTime).getHours();
                            const isMainHour = hour >= 8 && hour <= 18;
                            
                            return (
                              <div 
                                key={`${slot.partnerId}-${slot.startTime}`}
                                className={`
                                  flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors
                                  ${selectedSlot === slot
                                    ? 'border-blue-500 bg-blue-50' 
                                    : isMainHour
                                      ? 'border-gray-300 hover:bg-gray-50 bg-white'
                                      : 'border-gray-200 hover:bg-gray-50 bg-gray-50/50'
                                  }
                                  ${isMainHour ? 'shadow-sm' : ''}
                                `}
                                onClick={() => setSelectedSlot(slot)}
                              >
                                <div>
                                  <span className={`font-medium text-base ${isMainHour ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {(() => {
                                      const startHour = parseInt(slot.startTime.split('T')[1].split(':')[0]);
                                      const endHour = parseInt(slot.endTime.split('T')[1].split(':')[0]);
                                      const formatHour = (hour: number) => {
                                        if (hour === 0) return '12:00 AM';
                                        if (hour < 12) return `${hour}:00 AM`;
                                        if (hour === 12) return '12:00 PM';
                                        return `${hour - 12}:00 PM`;
                                      };
                                      return `${formatHour(startHour)} - ${formatHour(endHour)}`;
                                    })()}
                                  </span>
                                  {isMainHour && (
                                    <div className="mt-1">
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                        Prime Time
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <Badge variant="outline">
                                  Select
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No available slots for this date
                        </div>
                      )}

                      {selectedSlot && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800 mb-3">
                            {selectedSlot.partnerId === -1 ? (
                              (() => {
                                const startHour = parseInt(selectedSlot.startTime.split('T')[1].split(':')[0]);
                                const endHour = parseInt(selectedSlot.endTime.split('T')[1].split(':')[0]);
                                const formatHour = (hour: number) => {
                                  if (hour === 0) return '12:00 AM';
                                  if (hour < 12) return `${hour}:00 AM`;
                                  if (hour === 12) return '12:00 PM';
                                  return `${hour - 12}:00 PM`;
                                };
                                return `Request booking for ${formatDateForDisplay(formatDate(selectedDate))} from ${formatHour(startHour)} to ${formatHour(endHour)} - we'll search for available providers`;
                              })()
                            ) : (
                              `Confirm booking for ${formatDateForDisplay(formatDate(selectedDate))} from ${new Date(selectedSlot.startTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })} to ${new Date(selectedSlot.endTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })} with ${selectedSlot.partnerName}`
                            )}
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleRequestService} 
                              size="sm"
                              disabled={bookingLoading}
                              className="relative"
                            >
                              {bookingLoading && (
                                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
                              <span className={bookingLoading ? "ml-5" : ""}>
                                {bookingLoading ? 'Searching...' : 'Request Service'}
                              </span>
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setSelectedSlot(null);
                                setShowResults(false);
                                setBookingResponse(null);
                              }}
                              size="sm"
                              disabled={bookingLoading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      Please select a date from the calendar to view available slots
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {showResults && bookingResponse && (
            <Card className="mt-6">
              <CardHeader>
                {(() => {
                  console.log('🔍 UI Render Debug:', {
                    hasBookingResponse: !!bookingResponse,
                    status: bookingResponse?.status,
                    availabilitiesLength: bookingResponse?.nearestAvailabilities?.length,
                    availabilities: bookingResponse?.nearestAvailabilities
                  });
                  
                  if (bookingResponse.nearestAvailabilities?.length > 0) {
                    if (bookingResponse.status === 'confirmed') {
                      const serviceName = services.find(s => s.id === selectedService)?.name || 'service provider';
                      return (
                        <>
                          <CardTitle className="text-green-700">🎉 Booking Confirmed!</CardTitle>
                          <CardDescription>
                            Perfect match! We found a {serviceName.toLowerCase()} available for your exact time slot. Click &ldquo;Complete Booking&rdquo; below to finalize your appointment.
                          </CardDescription>
                        </>
                      );
                    }
                    
                    if (bookingResponse.status === 'pending') {
                      const serviceName = services.find(s => s.id === selectedService)?.name || 'service providers';
                      return (
                        <>
                          <CardTitle>Alternative Time Slots Available</CardTitle>
                          <CardDescription>
                            We didn&apos;t find an exact match for your specific time, but we have {bookingResponse.nearestAvailabilities?.length || 0} alternative {serviceName.toLowerCase()} time slot{(bookingResponse.nearestAvailabilities?.length || 0) > 1 ? 's' : ''} available. Please choose from the following options:
                          </CardDescription>
                        </>
                      );
                    }
                    
                    if (bookingResponse.status === 'cancelled_failure') {
                      const serviceName = services.find(s => s.id === selectedService)?.name || 'service providers';
                      return (
                        <>
                          <CardTitle>No Availability for Your Selected Time</CardTitle>
                          <CardDescription>
                            Your selected time slot isn&apos;t available, but here are {bookingResponse.nearestAvailabilities?.length || 0} upcoming {serviceName.toLowerCase()} availability options you can book:
                          </CardDescription>
                        </>
                      );
                    }
                    
                    const serviceName = services.find(s => s.id === selectedService)?.name || 'service providers';
                    return (
                      <>
                        <CardTitle>Available Options</CardTitle>
                        <CardDescription>
                          We found {bookingResponse.nearestAvailabilities?.length || 0} available {serviceName.toLowerCase()}{(bookingResponse.nearestAvailabilities?.length || 0) > 1 ? 's' : ''} for you:
                        </CardDescription>
                      </>
                    );
                  }
                  
                  return (
                    <>
                      <CardTitle>No Availability</CardTitle>
                      <CardDescription>
                        No providers are currently available for this time slot or the next 2 days. Please try selecting a different date.
                      </CardDescription>
                    </>
                  );
                })()}
              </CardHeader>
              <CardContent>
                {bookingResponse.nearestAvailabilities?.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {bookingResponse.nearestAvailabilities.map((availability, index) => (
                      <div 
                        key={`${availability.partnerId}-${availability.startTime}-${index}`}
                        className={`flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors ${
                          bookingResponse.status === 'confirmed' 
                            ? 'border-green-200 bg-green-50 hover:bg-green-100' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{availability.partnerName}</p>
                            {bookingResponse.status === 'confirmed' && (
                              <Badge variant="default" className="bg-green-600 text-white">
                                ✓ Available
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {(() => {
                              // Parse times as they are without timezone conversion
                              const startTime = availability.startTime.split('T')[1].split('.')[0]; // "01:00:00"
                              const endTime = availability.endTime.split('T')[1].split('.')[0]; // "02:00:00"
                              
                              const formatTime = (timeStr: string) => {
                                const [hours, minutes] = timeStr.split(':');
                                const hour = parseInt(hours);
                                const ampm = hour >= 12 ? 'PM' : 'AM';
                                const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                                return `${displayHour}:${minutes} ${ampm}`;
                              };

                              return `${new Date(availability.startTime).toLocaleDateString()} at ${formatTime(startTime)} - ${formatTime(endTime)}`;
                            })()}
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          disabled={bookingLoading}
                          className="relative"
                          variant={bookingResponse.status === 'cancelled_failure' ? 'outline' : 'default'}
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmBooking(availability.partnerId);
                          }}
                        >
                          {bookingLoading && (
                            <div className="absolute left-2 top-1/2 -translate-y-1/2">
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                          <span className={bookingLoading ? "ml-5" : ""}>
                            {bookingLoading 
                              ? 'Confirming...' 
                              : bookingResponse.status === 'cancelled_failure' 
                                ? 'Book This Time'
                                : bookingResponse.status === 'pending'
                                  ? 'Book This Slot'
                                  : bookingResponse.status === 'confirmed'
                                    ? 'Complete Booking'
                                    : 'Confirm Booking'
                            }
                          </span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {(bookingResponse.nearestAvailabilities?.length === 0 || !bookingResponse.nearestAvailabilities) && (
                  <div className="text-center py-8">
                    <p className="text-lg font-medium text-gray-900 mb-2">No availability found</p>
                    <p className="text-gray-600 mb-6">
                      Try selecting a different date, or check back later for new openings.
                    </p>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowResults(false);
                      setBookingResponse(null);
                    }}
                    disabled={bookingLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  </Layout>
  )
}