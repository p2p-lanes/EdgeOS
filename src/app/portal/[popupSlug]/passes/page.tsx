'use client'

import { useEffect } from 'react'
import { useCityProvider } from '@/providers/cityProvider'
import { useRouter } from 'next/navigation'
import { Loader } from '@/components/ui/Loader'
import Snow from '@/components/Animations/Snow'
import TabsContainer from './components/Sidebar/TabsContainer'
import ListAttendees from './components/Attendees/ListAttendees'
import { usePassesProvider } from '@/providers/passesProvider'

export default function Passes() {
  const { getRelevantApplication } = useCityProvider()
  const { products, payments, passes } = usePassesProvider()

  const application = getRelevantApplication()
  
  if(!application || !products || !payments || products.length === 0) return <Loader/>

  return (
      <div className="p-4 w-full mx-auto relative">
        {/* <Snow /> */}
        <div className="grid grid-cols-1 xl:grid-cols-[50%,50%] gap-6 relative z-10">
        <ListAttendees/>
        <TabsContainer productsPurchase={products} attendees={passes} payments={payments} discount={application.discount_assigned || 0}/>
      </div>
    </div>
  )
}

