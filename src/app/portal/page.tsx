'use client'

import { EventCard } from "@/components/EventCard"
import { useCityProvider } from "@/providers/cityProvider"
import { useRouter } from "next/navigation"


export default function Home() {
  const { getCity, getApplications } = useCityProvider()
  const router = useRouter()
  const city = getCity()
  const applications = getApplications()
  console.log('la city es', city)
  console.log('la application es', applications)
  const relevantApplication = applications?.filter((app: any) => app.popup_city_id == city?.id)?.slice(-1)[0]
  console.log('la relevnat es',relevantApplication)
  if(!city && !applications) return null

  return (
    <main className="container mx-auto px-4 py-8">
      <section>
        <div className="space-y-6">
          <EventCard
            {...city}
            onApply={() => router.push(`/portal/form/${city.id}`)}
            status={relevantApplication?.status}
          />
        </div>
      </section>
    </main>
  )
}

