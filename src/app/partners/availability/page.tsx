
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { type DateRange } from "react-day-picker"
import { availabilityApi, combineDateAndTime } from "@/lib/api"
import { Availability } from "@/types/availability"
import { Skeleton } from "@/components/ui/skeleton"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

export default function AvailabilityPage() {
  const { data: session, status } = useSession()
  const [selectedDate, setSelectedDate] = useState<Date | DateRange | undefined>()
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'add' | 'show'>('add')
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status === 'unauthenticated') {
      window.location.href = '/partners/register'
      return
    }

    if (session && session.user.userType !== 'partner') {
      window.location.href = '/partners/register'
      return
    }
  }, [session, status])

  useEffect(() => {
    if (session?.user?.id) {
      loadPartnerAvailability()
    }
  }, [session])

  const loadPartnerAvailability = async () => {
    try {
      setIsLoading(true)
      const partnerId = parseInt(session?.user?.id || '0')
      
      const response = await fetch(`${API_BASE_URL}/availability?partnerId=${partnerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const responseData = await response.json() as any[]
      
      const transformedData = responseData.map((item: any): Availability => ({
        id: item.id.toString(),
        date: item.startTime.split('T')[0],
        time: item.startTime.split('T')[1].substring(0, 5),
        endTime: item.endTime.split('T')[1].substring(0, 5),
        isBooked: !item.isAvailable
      }))
      
      setAvailabilities(transformedData)
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Failed to load your availability. Please try again.'
      errorMessage = 'Something went wrong! Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 0; hour < 24; hour++) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      const ampm = hour < 12 ? 'AM' : 'PM'
      const time24 = `${hour.toString().padStart(2, '0')}:00`
      const time12 = `${hour12}:00 ${ampm}`
      slots.push({ time24, time12, hour })
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const formatDate = (date: Date) => {

    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getSelectedDates = () => {
    if (!selectedDate) return []
    
    if (selectedDate instanceof Date) {
      return [selectedDate]
    }
    
    if (selectedDate.from && selectedDate.to) {
      const dates = []
      const currentDate = new Date(selectedDate.from)
      const endDate = new Date(selectedDate.to)
      
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }
      return dates
    }
    
    if (selectedDate.from) {
      return [selectedDate.from]
    }
    
    return []
  }

  const isTimeSlotAvailable = (time: string, date: Date) => {
    const dateStr = formatDate(date)
    return availabilities.some(
      availability => availability.date === dateStr && availability.time === time
    )
  }

  const isTimeSlotBooked = (time: string, date: Date) => {
    const dateStr = formatDate(date)
    const slot = availabilities.find(
      availability => availability.date === dateStr && availability.time === time
    )
    return slot?.isBooked || false
  }

  const isTimeSlotSelected = (time: string) => {
    return selectedTimeSlots.includes(time)
  }

  const handleTimeSlotClick = (time: string) => {
    if (selectedTimeSlots.includes(time)) {

      setSelectedTimeSlots(prev => prev.filter(t => t !== time))
    } else {

      setSelectedTimeSlots(prev => [...prev, time])
    }
  }

  const handleConfirmAvailability = async () => {
    const selectedDates = getSelectedDates()
    if (selectedDates.length === 0 || selectedTimeSlots.length === 0) {
      toast.error('Please select dates and time slots')
      return
    }
    
    if (!session?.user?.id) {
      toast.error('You must be logged in to manage availability')
      return
    }

    setIsSubmitting(true)
    
    try {
      const partnerId = parseInt(session.user.id)
      const newAvailabilities: Availability[] = []
      const removedIds: string[] = []
      const promises: Promise<any>[] = []
      
      selectedDates.forEach(date => {
        const dateStr = formatDate(date)
        
        selectedTimeSlots.forEach(time => {
          const existingSlot = availabilities.find(
            availability => availability.date === dateStr && availability.time === time
          )

          if (existingSlot) {
            removedIds.push(existingSlot.id)
            promises.push(
              fetch(`${API_BASE_URL}/availability/${existingSlot.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
              })
            )
          } else {
            const startHour = parseInt(time.split(':')[0])
            const endHour = (startHour + 1) % 24
            const endTime = `${endHour.toString().padStart(2, '0')}:00`
            
            const endDateStr = endHour === 0 ? formatDate(new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000)) : dateStr
            
            newAvailabilities.push({
              id: `${Date.now()}-${dateStr}-${time}`,
              date: dateStr,
              time: time,
              endTime: endTime,
              isBooked: false
            })
            
            promises.push(
              fetch(`${API_BASE_URL}/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  partnerId,
                  startTime: combineDateAndTime(dateStr, time),
                  endTime: combineDateAndTime(endDateStr, endTime)
                })
              })
            )
          }
        })
      })
      
      const results = await Promise.all(promises)
      
      const failedRequests = results.filter(response => !response.ok)
      
      if (failedRequests.length > 0) {
        const firstError = failedRequests[0]
        let errorMessage = `Request failed with status ${firstError.status}`
        
        try {
          const errorData = await firstError.json()
          
          errorMessage = 'Something went wrong! Please try again.'
        } catch (parseError) {
        }
        
        throw new Error(errorMessage)
      }
      
      setAvailabilities(prev => {
        const filtered = prev.filter(availability => !removedIds.includes(availability.id))
        return [...filtered, ...newAvailabilities]
      })
      
      const addCount = newAvailabilities.length
      const removeCount = removedIds.length
      
      if (addCount > 0 && removeCount > 0) {
        toast.success(`Updated availability: ${addCount} slots added, ${removeCount} slots removed`)
      } else if (addCount > 0) {
        toast.success(`${addCount} availability slot${addCount > 1 ? 's' : ''} added successfully`)
      } else if (removeCount > 0) {
        toast.success(`${removeCount} availability slot${removeCount > 1 ? 's' : ''} removed successfully`)
      }
      
      setSelectedTimeSlots([])
      
      await loadPartnerAvailability()
      
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Failed to update availability. Please try again.'
      errorMessage = 'Something went wrong! Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClearSelection = () => {
    setSelectedTimeSlots([])
  }

  const handleRemoveAvailability = async (id: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/availability/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      setAvailabilities(prev => prev.filter(availability => availability.id !== id))
      toast.success('Availability slot removed successfully')
      
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Failed to remove availability slot. Please try again.'
      errorMessage = 'Something went wrong! Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDateForDisplay = (dateStr: string) => {

    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTimeForDisplay = (time: string) => {
    const hour = parseInt(time.split(':')[0])
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const ampm = hour < 12 ? 'AM' : 'PM'
    return `${hour12}:00 ${ampm}`
  }

  const groupedAvailabilities = availabilities.reduce((groups, availability) => {
    const date = availability.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(availability)
    return groups
  }, {} as Record<string, typeof availabilities>)

  Object.keys(groupedAvailabilities).forEach(date => {
    groupedAvailabilities[date].sort((a: Availability, b: Availability) => a.time.localeCompare(b.time))
  })

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8 px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-9 w-80 mb-2" />
                <Skeleton className="h-5 w-96" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-36" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-80 w-full rounded-lg" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
                <div className="mt-6">
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated' || (session && session.user.userType !== 'partner')) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {viewMode === 'add' ? 'Set Your Availability' : 'Your Availability Schedule'}
              </h1>
              <p className="text-muted-foreground">
                {viewMode === 'add' 
                  ? 'Select a date and choose your available time slots'
                  : 'View and manage your current availability'
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'add' ? 'default' : 'outline'}
                onClick={() => setViewMode('add')}
              >
                Add Availability
              </Button>
              <Button 
                variant={viewMode === 'show' ? 'default' : 'outline'}
                onClick={() => setViewMode('show')}
              >
                Show Availability
              </Button>
            </div>
          </div>
        </div>

        {viewMode === 'add' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>
                  Choose a date to set your availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="range"
                  selected={selectedDate as DateRange}
                  onSelect={setSelectedDate}
                  className="rounded-lg border shadow-sm"
                  disabled={(date) => date < new Date()}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {getSelectedDates().length > 0
                    ? `Available Times - ${getSelectedDates().length === 1 
                        ? getSelectedDates()[0].toLocaleDateString()
                        : `${getSelectedDates().length} days selected`
                      }`
                    : "Select date(s) to view time slots"
                  }
                </CardTitle>
                <CardDescription>
                  Click on time slots to select multiple times. Hold Ctrl/Cmd to select multiple.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getSelectedDates().length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {timeSlots.map((slot) => {
                        const selectedDates = getSelectedDates()
                        const isSelected = isTimeSlotSelected(slot.time24)
                        
                        const availabilityStatus = selectedDates.map(date => ({
                          date,
                          isAvailable: isTimeSlotAvailable(slot.time24, date),
                          isBooked: isTimeSlotBooked(slot.time24, date)
                        }))
                        
                        const hasAnyBooked = availabilityStatus.some(status => status.isBooked)
                        const hasAnyAvailable = availabilityStatus.some(status => status.isAvailable)
                        
                        return (
                          <div 
                            key={slot.time24}
                            className={`
                              flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors
                              ${isSelected 
                                ? 'border-blue-500 bg-blue-50' 
                                : hasAnyBooked 
                                  ? 'border-red-200 bg-red-50 hover:bg-red-100'
                                  : hasAnyAvailable
                                    ? 'border-green-200 bg-green-50 hover:bg-green-100'
                                    : 'border-gray-200 hover:bg-gray-50'
                              }
                            `}
                            onClick={() => handleTimeSlotClick(slot.time24)}
                          >
                            <span className="font-medium text-base">{slot.time12}</span>
                            <div className="flex items-center gap-2">
                              {hasAnyBooked && (
                                <Badge variant="primary">Booked</Badge>
                              )}
                              {hasAnyAvailable && !hasAnyBooked && (
                                <Badge variant="default">Available</Badge>
                              )}
                              {!hasAnyAvailable && !hasAnyBooked && (
                                <Badge variant="outline">Not Set</Badge>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {selectedTimeSlots.length > 0 && (
                      (() => {
                        const selectedDates = getSelectedDates()
                        
                        const slotsToRemove = selectedTimeSlots.filter(timeSlot => 
                          selectedDates.some(date => isTimeSlotAvailable(timeSlot, date))
                        )
                        const slotsToAdd = selectedTimeSlots.filter(timeSlot => 
                          !selectedDates.some(date => isTimeSlotAvailable(timeSlot, date))
                        )
                        
                        const isRemovalAction = slotsToRemove.length > 0
                        const actionType = isRemovalAction 
                          ? (slotsToAdd.length > 0 ? 'mixed' : 'remove')
                          : 'add'
                        
                        const bgColor = actionType === 'remove' ? 'bg-red-50' : actionType === 'mixed' ? 'bg-yellow-50' : 'bg-blue-50'
                        const borderColor = actionType === 'remove' ? 'border-red-200' : actionType === 'mixed' ? 'border-yellow-200' : 'border-blue-200'
                        const textColor = actionType === 'remove' ? 'text-red-800' : actionType === 'mixed' ? 'text-yellow-800' : 'text-blue-800'
                        
                        return (
                          <div className={`mt-6 p-4 rounded-lg border ${bgColor} ${borderColor}`}>
                            <p className={`text-sm mb-3 ${textColor}`}>
                              {actionType === 'remove' && `Remove availability for ${selectedTimeSlots.length} time slot(s) from ${getSelectedDates().length} day(s)`}
                              {actionType === 'add' && `Add availability for ${selectedTimeSlots.length} time slot(s) to ${getSelectedDates().length} day(s)`}
                              {actionType === 'mixed' && `Update availability: ${slotsToAdd.length} to add, ${slotsToRemove.length} to remove`}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {selectedTimeSlots.map(timeSlot => {
                                const slot = timeSlots.find(s => s.time24 === timeSlot)
                                const willBeRemoved = slotsToRemove.includes(timeSlot)
                                return (
                                  <Badge 
                                    key={timeSlot} 
                                    variant={willBeRemoved ? "destructive" : "secondary"}
                                  >
                                    {slot?.time12} {willBeRemoved && "(Remove)"}
                                  </Badge>
                                )
                              })}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={handleConfirmAvailability} 
                                size="sm"
                                variant={actionType === 'remove' ? 'destructive' : 'default'}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? 'Processing...' : (
                                  actionType === 'remove' ? 'Remove Availability' :
                                  actionType === 'add' ? 'Confirm Availability' :
                                  'Update Availability'
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={handleClearSelection}
                                size="sm"
                              >
                                Clear Selection
                              </Button>
                            </div>
                          </div>
                        )
                      })()
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    Please select date(s) from the calendar to view available time slots
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedAvailabilities).length > 0 ? (
              Object.keys(groupedAvailabilities)
                .sort()
                .map(date => (
                  <Card key={date}>
                    <CardHeader>
                      <CardTitle className="text-xl">
                        {formatDateForDisplay(date)}
                      </CardTitle>
                      <CardDescription>
                        {groupedAvailabilities[date].length} available time slot(s)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {groupedAvailabilities[date].map((availability: Availability) => (
                          <div 
                            key={availability.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-green-50 border-green-200"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-base">
                                {formatTimeForDisplay(availability.time)}
                              </span>
                              <Badge variant={availability.isBooked ? "destructive" : "default"}>
                                {availability.isBooked ? "Booked" : "Available"}
                              </Badge>
                            </div>
                                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveAvailability(availability.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={isLoading}
                            >
                              {isLoading ? 'Removing...' : 'Remove'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No availability slots set yet
                  </p>
                  <Button onClick={() => setViewMode('add')}>
                    Add Your First Availability
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}