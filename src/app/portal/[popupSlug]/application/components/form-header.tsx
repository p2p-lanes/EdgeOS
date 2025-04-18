'use client'

import { useCityProvider } from "@/providers/cityProvider"
import { CalendarDays, MapPin } from "lucide-react"

export function FormHeader() {
  const { getCity } = useCityProvider()
  const city = getCity()

  if(!city) return null

  const startDate = new Date(city.start_date)?.toLocaleDateString('en-EN', {day: 'numeric', month: 'long', year: 'numeric'})
  const endDate = new Date(city.end_date)?.toLocaleDateString('en-EN', {day: 'numeric', month: 'long', year: 'numeric'})

  return (
    <div className="flex flex-col md:flex-row gap-6 space-y-6">
      <div className="flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={city.image_url}
          alt={city.name}
          style={{height: 'auto'}}
          className="w-full md:min-h-[180px] md:w-[20vw] md:max-w-[240px] object-cover dark:invert rounded-2xl"
        />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{city.name}</h1>
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
          (startDate && endDate) && (
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <CalendarDays className="mr-2 h-4 w-4" />
              {startDate + ' - ' + endDate}
            </div>
          )
        }
      </div>
    </div>
  )
}

