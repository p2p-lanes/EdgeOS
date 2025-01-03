'use client'

import { useState, useEffect } from 'react'
import { useCityProvider } from '@/providers/cityProvider'
import { useRouter } from 'next/navigation'
import { Loader } from '@/components/ui/Loader'
import useGetData from './hooks/useGetData'
import ListAttendees from './components/ListAttendees'
import PassesSidebar from './components/PassesSidebar'
import { AttendeeProps } from '@/types/Attendee'
import { sortAttendees } from './helpers/filter'
import Snow from '@/components/Animations/Snow'

export default function Home() {
  const [attendees, setAttendees] = useState<AttendeeProps[]>([])
  const { getRelevantApplication, getProducts } = useCityProvider()
  const { payments } = useGetData()
  const application = getRelevantApplication()
  const router = useRouter()
  const products = getProducts()

  useEffect(() => {
    if(!application) return;

    if(application.status !== 'accepted'){
      router.replace('./')
      return;
    }

    setAttendees(sortAttendees(application.attendees));
  }, [application])

  if(!application || !products || !payments || products.length === 0) return <Loader/>

  const discountApplication = application.ticket_category === 'discounted' && application.discount_assigned ? application.discount_assigned : 0

  return (
    <div className="p-4 w-full mx-auto relative">
      <Snow />
      <div className="grid grid-cols-1 xl:grid-cols-[50%,50%] gap-6 relative z-10">
        <ListAttendees attendees={attendees}/>
        <PassesSidebar productsPurchase={products} attendees={attendees} payments={payments} discount={discountApplication}/>
      </div>
    </div>
  )
}

