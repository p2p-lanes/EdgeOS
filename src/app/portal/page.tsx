'use client'

import { EventCard } from "@/components/EventCard"
import { useCityProvider } from "@/providers/cityProvider"
import { useRouter } from "next/navigation"


export default function Home() {
  const { getCity, getApplication } = useCityProvider()
  const router = useRouter()
  const city = getCity()
  const application = getApplication()

  if(!city && !application) return null

  return (
    <main className="container mx-auto px-4 py-8">
      <section>
        <div className="space-y-6">
          <EventCard
            {...city}
            onApply={() => router.push(`/portal/form/${city.id}`)}
            status={application?.status}
          />
        </div>
      </section>
    </main>
  )
}

