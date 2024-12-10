'use client'

import { useCityProvider } from "@/providers/cityProvider"
import SectionWrapper from "./SectionWrapper"
import { CalendarDays, MapPin } from "lucide-react"
import { useEffect } from "react"
import useWindow from "@/hooks/useWindow"
import { useState } from "react"

export function FormHeader() {
  const { isClient } = useWindow()
  const { getCity } = useCityProvider()
  const city = getCity()

  const [calendarDays, setCalendarDays] = useState('')

  useEffect(() => {
    if(!isClient || !city?.start_date || !city?.end_date) return

    const startDate = new Date(city.start_date).toLocaleDateString('en-EN', {day: 'numeric', month: 'long', year: 'numeric'})
    const endDate = new Date(city.end_date).toLocaleDateString('en-EN', {day: 'numeric', month: 'long', year: 'numeric'})
    const calendarDays = startDate + ' - ' + endDate
    setCalendarDays(calendarDays)
  }, [city?.start_date, city?.end_date, isClient])

  if(!city) return null

  return (
    <SectionWrapper>
      <div className="flex items-center">
        <img
          src={city.image_url}
          alt={city.name}
          style={{ width: '20vw', height: 'auto', maxWidth: '240px', borderRadius: '14px' }}
          className="dark:invert"
        />
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{city.name} Application</h1>
        <p className="text-md text-muted-foreground">
          {city.tagline}
        </p>
        {
          city.location && (
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <MapPin className="mr-2 h-4 w-4" />
              {city.location}
            </div>
          )
        }
        {
          city.start_date && (
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <CalendarDays className="mr-2 h-4 w-4" />
              {calendarDays}
            </div>
          )
        }
      </div>
    </SectionWrapper>
  )
}

