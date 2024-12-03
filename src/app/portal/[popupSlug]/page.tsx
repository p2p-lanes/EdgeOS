'use client'

import { EventCard } from "@/components/Card/EventCard"
import { EventStatus } from "@/components/Card/EventProgressBar"
import { Loader } from "@/components/ui/Loader"
import { useCityProvider } from "@/providers/cityProvider"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home() {
  const { getCity, getRelevantApplication } = useCityProvider()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const city = getCity()
  const relevantApplication = getRelevantApplication()
  
  if(!city && !relevantApplication) return null

  const onClickApply = () => {
    if(relevantApplication?.status === 'accepted') {
      window.open('https://www.pagar.simplefi.tech/edge-city', '_blank')
      return;
    }
    setIsLoading(true)
    router.push(`/portal/${city?.slug}/application`)
  }

  if(isLoading) return <Loader />

  return (
    <main className="container mx-auto px-4 py-8">
      <section>
        <div className="space-y-6">
          <EventCard
            {...city!}
            onApply={onClickApply}
            status={relevantApplication?.status as EventStatus}
          />
        </div>
      </section>
    </main>
  )
}

