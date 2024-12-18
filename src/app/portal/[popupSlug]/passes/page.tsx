'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCityProvider } from '@/providers/cityProvider'
import { useRouter } from 'next/navigation'
import { Loader } from '@/components/ui/Loader'
import useGetData from './hooks/useGetData'
import usePostData from './hooks/usePostData'
import ListAttendees from './components/ListAttendees'
import PassesSidebar from './components/PassesSidebar'
import { AttendeeProps } from '@/types/Attendee'
import { sortAttendees } from './helpers/filter'

export default function Home() {
  const [attendees, setAttendees] = useState<AttendeeProps[]>([])
  const { getRelevantApplication } = useCityProvider()
  const application = getRelevantApplication()
  const router = useRouter()
  const { products, payments } = useGetData()

  useEffect(() => {
    if(!application) return;

    if(application.status !== 'accepted'){
      router.replace('./')
      return;
    }

    setAttendees(sortAttendees(application.attendees));
  }, [application])

  if(!application || !products || !payments || products.length === 0) return <Loader/>

  console.log('Data:', {application, products, payments})

  return (
     <div className="p-4 w-full mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-[60%,40%] gap-6">
        <ListAttendees attendees={attendees}/>
        
        <PassesSidebar productsPurchase={products} attendees={attendees} payments={payments}/>
      </div>
    </div>
  )
}

