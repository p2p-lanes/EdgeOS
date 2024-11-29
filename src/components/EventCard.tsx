'use client'

import { CalendarDays, MapPin } from 'lucide-react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EventProgressBar, EventStatus } from './EventProgressBar'
import { PopupsProps } from '@/types/Popups'

interface EventCardProps extends PopupsProps {
  status?: EventStatus
  onApply: () => void
}

export function EventCard({ id, name, tagline, location, start_date, end_date, image_url, status = 'not_started', onApply }: EventCardProps) {
  return (
    <Card className="w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-48 sm:h-auto sm:w-1/3">
          <img
            src={image_url ?? "https://pbs.twimg.com/profile_images/1804985211740205056/iIJQisAK_400x400.png"}
            alt={name}
            className="object-cover h-full w-full"
          />
        </div>
        <CardContent className="flex-1 p-6 mr-10">
          <h3 className="text-2xl font-bold mb-2">{name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{tagline}</p>
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <MapPin className="mr-2 h-4 w-4" />
            {location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <CalendarDays className="mr-2 h-4 w-4" />
            {start_date && new Date(start_date).toLocaleDateString('en-EN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) + ' - ' + (end_date ? new Date(end_date).toLocaleDateString('en-EN', {
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            }) : '')}
          </div>
          <div className="mb-4">
            <EventProgressBar status={status} />
          </div>
          <div className="flex justify-center sm:justify-start">
            <Button onClick={onApply}>
              {status === 'not_started' ? 'Apply' : 
               status === 'draft' ? 'Continue Application' :
               status === 'in review' ? 'View Application' :
               status === 'accepted' ? 'Purchase Ticket' : 'Modify Ticket'}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

