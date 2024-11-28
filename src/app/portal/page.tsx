'use client'

import { EventCard } from "@/components/EventCard"
import useGetPopups from "./hooks/useGetPopups"
import { useRouter } from "next/navigation"


export default function Home() {
  const router = useRouter()
  const {popups} = useGetPopups()

  if(!popups) return null

  return (
    <main className="container mx-auto px-4 py-8">
      <section>
        <div className="space-y-6">
          {popups.map((event, index) => (
            <EventCard
              key={index}
              {...event}
              onApply={() => router.push(`/portal/form/${event.id}`)}
            />
          ))}
        </div>
      </section>
    </main>
  )
}

