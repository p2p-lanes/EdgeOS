'use client'

import { EventCard } from "@/components/EventCard"
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
    setIsLoading(true)
    router.push(`/portal/${city.slug}/application`)
  }

  if(isLoading) return <Loader />

  return (
    <main className="container mx-auto px-4 py-8">
      <section>
        <div className="space-y-6">
          <EventCard
            {...city}
            onApply={onClickApply}
            status={relevantApplication?.status}
          />
        </div>
      </section>
    </main>
  )
}

