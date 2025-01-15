'use client'

import { useState, useEffect } from 'react'
import { useCityProvider } from '@/providers/cityProvider'
import { useRouter } from 'next/navigation'
import { Loader } from '@/components/ui/Loader'
import useGetData from './hooks/useGetData'
import { AttendeeProps } from '@/types/Attendee'
import { sortAttendees } from './helpers/filter'
import Snow from '@/components/Animations/Snow'
import TabsContainer from './components/Sidebar/TabsContainer'
import ListAttendees from './components/Attendees/ListAttendees'

export default function Home() {
  const [attendees, setAttendees] = useState<AttendeeProps[]>([])
  const { getRelevantApplication } = useCityProvider()
  const { payments, loading, products } = useGetData()
  const application = getRelevantApplication()
  const router = useRouter()

  useEffect(() => {
    if(!application) return;

    if(application.status !== 'accepted'){
      router.replace('./')
      return;
    }

    setAttendees(sortAttendees(application.attendees));
  }, [application])


  if(!application || !products || !payments || products.length === 0 || loading) return <Loader/>

  return (
    <div className="p-4 w-full mx-auto relative">
      {/* <Snow /> */}
      <div className="grid grid-cols-1 xl:grid-cols-[50%,50%] gap-6 relative z-10">
        <ListAttendees attendees={attendees}/>
        <TabsContainer productsPurchase={products} attendees={attendees} payments={payments} discount={application.discount_assigned || 0}/>
      </div>
    </div>
  )
}

