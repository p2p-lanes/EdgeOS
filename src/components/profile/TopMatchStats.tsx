import { useCallback, useEffect, useState } from "react"
import { Card } from "../ui/card"
import { Users } from "lucide-react"
import { Event } from "@/types/StatsSocialLayer"
import { EventParticipant } from "@/types/StatsSocialLayer"
import { CitizenProfile } from "@/types/Profile"
import { Skeleton } from "../ui/skeleton"
import { Avatar } from "../ui/avatar"
import Image from "next/image"


interface MatchedPerson {
  email: string
  nickname: string
  username: string
  image_url: string
  eventsCount: number
}

const TopMatchStats = ({userData, eventsLoading, events}: {userData: CitizenProfile | null, eventsLoading: boolean, events: any}) => {
  const [topMatches, setTopMatches] = useState<MatchedPerson[]>([])

  const calculateTopMatches = useCallback(() => {
    if (!events || events.length === 0 || !userData) {
      setTopMatches([])
      return
    }

    const userEmails = [userData.primary_email, userData.secondary_email].filter((e): e is string => !!e && e !== "")

    // Crear un mapa para contar apariciones de cada participante
    const participantCounts: Record<string, MatchedPerson> = {}

    events.forEach((event: any) => {
      if (event.participants) {
        event.participants.forEach((participant: EventParticipant) => {
          const profile = participant.profile
          if (profile && !userEmails.includes(profile.email)) {
            const email = profile.email
            
            if (participantCounts[email]) {
              participantCounts[email].eventsCount += 1
            } else {
              participantCounts[email] = {
                email: profile.email,
                nickname: profile.nickname || profile.username || 'Usuario',
                username: profile.username || profile.email,
                image_url: profile.image_url || '',
                eventsCount: 1
              }
            }
          }
        })
      }
    })

    // Convertir a array, ordenar por eventsCount y tomar top 3
    const sortedMatches = Object.values(participantCounts)
      .sort((a, b) => b.eventsCount - a.eventsCount)
      .slice(0, 5)

    setTopMatches(sortedMatches)
  }, [userData, events])

  useEffect(() => {
    if(!userData || !events) return
    calculateTopMatches()
  }, [userData, events])

  return (
    <Card className="p-6">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Top Connections</h2>
          <p className="text-sm text-gray-600">People with whom you’ve overlapped the most at specific Social Layer calendar events.</p>
        </div>
        <div className="flex-1 flex flex-col gap-3 mt-2">
          {eventsLoading ? (
            // Skeleton loading state
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="w-20 h-3 mb-1" />
                    <Skeleton className="w-16 h-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : topMatches.length > 0 ? (
            // Show top matches
            topMatches.map((match, index) => (
              <div key={match.email} className="flex items-center justify-between gap-3 mt-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <Avatar className="w-9 h-9">
                      {match.image_url ? (
                        <Image 
                          src={match.image_url} 
                          alt={match.nickname}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {match.nickname.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </Avatar>
                    {/* <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                      {match.eventsCount}
                    </div> */}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate" title={match.nickname}>
                      {match.nickname}
                    </p>
                    <p className="text-xs text-gray-500 truncate" title={match.email}>
                      {match.email}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium text-blue-400 text-right shrink-0">
                  {match.eventsCount}
                  <p className="text-xs text-gray-500">events</p>
                </div>
              </div>
            ))
          ) : (
            // No matches state
            <div className="flex flex-col items-center justify-center flex-1 text-center py-4">
              <Users className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No shared events found</p>
              <p className="text-xs text-gray-400">Attend more events to find matches</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default TopMatchStats