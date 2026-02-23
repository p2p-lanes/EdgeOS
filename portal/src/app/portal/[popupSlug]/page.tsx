"use client"

import { useRouter } from "next/navigation"
import { EventCard } from "@/components/Card/EventCard"
import type { EventStatus } from "@/components/Card/EventProgressBar"
import { useApplication } from "@/providers/applicationProvider"
import { useCityProvider } from "@/providers/cityProvider"

export default function Home() {
  const { getCity } = useCityProvider()
  const { getRelevantApplication } = useApplication()
  const router = useRouter()
  const city = getCity()
  const relevantApplication = getRelevantApplication()

  if (!city) return null

  const status = (relevantApplication?.status as EventStatus) ?? "not_started"

  const onClickApply = () => {
    if (status === "accepted") {
      router.push(`/portal/${city.slug}/passes`)
      return
    }
    router.push(`/portal/${city.slug}/application`)
  }

  return (
    <section className="container mx-auto">
      <div className="space-y-6 max-w-5xl p-6 mx-auto">
        <EventCard popup={city} status={status}>
          <EventCard.Image />
          <EventCard.Content>
            <EventCard.Title />
            <EventCard.DateRange />
            <EventCard.Progress />
            <EventCard.ApplyButton onClick={onClickApply} />
          </EventCard.Content>
        </EventCard>
      </div>
    </section>
  )
}
