'use client'

import { CalendarDays, MapPin } from 'lucide-react'
import { CardAnimation, CardContent } from "@/components/ui/card"
import { ButtonAnimated } from "@/components/ui/button"
import { EventProgressBar, EventStatus } from './EventProgressBar'
import { PopupsProps } from '@/types/Popup'
import { Badge } from '../ui/badge'

interface EventCardProps extends PopupsProps {
  status?: EventStatus
  onApply: () => void
  canApply: boolean
}

export function EventCard({ name, tagline, location, start_date, end_date, image_url, status = 'not_started', onApply, canApply }: EventCardProps) {

  const startDate = new Date(start_date)?.toLocaleDateString('en-EN', {day: 'numeric', month: 'long', year: 'numeric'})
  const endDate = new Date(end_date)?.toLocaleDateString('en-EN', {day: 'numeric', month: 'long', year: 'numeric'})
  const calendarDays = startDate + ' - ' + endDate

  return (
    <CardAnimation anim={'entry'} duration={0.6} className="w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:h-auto sm:hidden lg:inline-block lg:w-1/3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image_url ?? "https://cdn.prod.website-files.com/67475a01312f8d8225a6b46e/6751bf69596d8a1e1a99d291_half-banner-min.jpg"}
            alt={name}
            className="object-cover w-full h-full"
          />
        </div>
        <CardContent className="flex flex-col w-full p-6 mr-10">
          <h3 className="text-2xl font-bold mb-2">{name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{tagline}</p>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="mr-2 h-4 w-4" />
            {location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <CalendarDays className="mr-2 h-4 w-4" />
            {calendarDays}
          </div>
          {
            canApply ? (
              <>
                <div className="my-6">
                  <EventProgressBar status={status} />
                </div>
                {status !== 'rejected' && (
                  <div className="flex items-end justify-end sm:justify-end">
                    <ButtonAnimated onClick={onApply} className='w-full md:w-auto px-9'>
                      {status === 'not_started' ? 'Apply' : 
                      status === 'draft' ? 'Continue Application' :
                      status === 'in review' ? 'Edit Application' :
                      status === 'accepted' ? 'Go to Passes' :
                      status === 'withdrawn' ? 'Resume Application' :
                      'Modify Ticket'}
                    </ButtonAnimated>
                  </div>
                )}
              </>
            ) : status === 'accepted' ? (
              <div  className="flex items-end justify-end sm:justify-end">
                  <ButtonAnimated onClick={onApply} className='w-full md:w-auto px-9'>
                    {status === 'accepted' ? 'Go to Passes' : null}
                  </ButtonAnimated>
                </div>
            ) : null
          }
        </CardContent>
      </div>
    </CardAnimation>
  )
}

