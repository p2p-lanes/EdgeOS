'use client'

import { EventCard } from "@/components/Card/EventCard"
import { EventStatus } from "@/components/Card/EventProgressBar"
import { Loader } from "@/components/ui/Loader"
import { dynamicForm } from "@/constants"
import { useApplication } from "@/providers/applicationProvider"
import { useCityProvider } from "@/providers/cityProvider"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Home() {
  const { getCity } = useCityProvider()
  const { getRelevantApplication } = useApplication()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const city = getCity()
  const relevantApplication = getRelevantApplication()
  
  if(!city && !relevantApplication) return null

  const onClickApply = () => {
    if(relevantApplication?.status === 'accepted') {
      router.push(`/portal/${city?.slug}/passes`)
      return;
    }
    setIsLoading(true)
    router.push(`/portal/${city?.slug}/application`)
  }
  
  if(isLoading) return <Loader />
  
  const canApply = dynamicForm[city?.slug ?? ''] !== null
  
  return (
    <section className="container mx-auto">
      <div className="space-y-6 max-w-5xl p-6 mx-auto">
        <EventCard
          {...city!}
          onApply={onClickApply}
          status={relevantApplication?.status as EventStatus}
          canApply={canApply}
        />
      </div>
    </section>
  )
}

