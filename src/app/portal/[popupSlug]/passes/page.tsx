'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import TicketBadge from './components/TicketBadge'
import { useCityProvider } from '@/providers/cityProvider'
import { useRouter } from 'next/navigation'
import { Loader } from '@/components/ui/Loader'

export default function Home() {
  const [selectedWeeks, setSelectedWeeks] = useState<{ [key: string]: string[] }>({})
  const [patronStatus, setPatronStatus] = useState<{ [key: string]: boolean }>({})
  const { getRelevantApplication } = useCityProvider()
  const application = getRelevantApplication()
  const router = useRouter()

  useEffect(() => {
    if(!application) return;

    if(application.status !== 'accepted'){
      router.replace('./')
      return;
    }
  }, [application])

  const handleWeekSelect = useCallback((name: string, weeks: string[]) => {
    setSelectedWeeks(prev => {
      const newState = { ...prev }
      if (weeks.length > 0) {
        newState[name] = weeks
      } else {
        delete newState[name]
      }
      return newState
    })
  }, [])

  const handlePatronStatusChange = useCallback((name: string, isPatron: boolean) => {
    setPatronStatus(prev => ({
      ...prev,
      [name]: isPatron
    }))
  }, [])

  const handleClickAction = () => {
    console.log('comrpaste', selectedWeeks, patronStatus)
  }

  if(!application) return <Loader/>

  return (
    <div className="container mx-auto p-4 lg:flex">
      <div className="flex-grow mb-4 lg:mb-0">
        <div className="space-y-4">
          <TicketBadge 
            name="Alejandro Romeo" 
            badge="group lead" 
            email="alejandro@gmail.com"
            initialPatronStatus={patronStatus["Alejandro Romeo"]}
            onWeekSelect={handleWeekSelect}
            onPatronStatusChange={handlePatronStatusChange}
            handleClickAction={handleClickAction}
          />
        </div>
      </div>
    </div>
  )
}

