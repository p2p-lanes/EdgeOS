'use client'

import { useEffect } from 'react'
import { useCityProvider } from '@/providers/cityProvider'
import { useParams, useRouter } from 'next/navigation'
import Snow from '@/components/Animations/Snow'
import TabsContainer from './components/Sidebar/TabsContainer'
import ListAttendees from './components/Attendees/ListAttendees'

export default function Passes() {
  const { getRelevantApplication } = useCityProvider()
  const application = getRelevantApplication();
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if(application === null) return;

    if(application === undefined || application.status !== 'accepted'){
      router.replace(`/portal/${params.popupSlug}`)
      return;
    }
  }, [application])


  return (
      <div className="p-4 w-full mx-auto relative">
        {/* <Snow /> */}
        <div className="grid grid-cols-1 xl:grid-cols-[50%,50%] gap-6 relative z-10">
        <ListAttendees/>
        <TabsContainer />
      </div>
    </div>
  )
}

