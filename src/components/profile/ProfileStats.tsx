import { useSocialLayer } from "@/hooks/useSocialLayer"
import { CitizenProfile } from "@/types/Profile"
import { Card } from "../ui/card"
import TopMatchStats from "./TopMatchStats"
import { useState } from "react"
import { ProfileData } from "@/types/StatsSocialLayer"
import { useEffect } from "react"
import { Skeleton } from "../ui/skeleton"
import { CalendarCheck2, CalendarPlus } from "lucide-react"

const ProfileStats = ({userData}: {userData: CitizenProfile | null}) => {
  const { getEventsFromEmail, eventsLoading, getProfileFromEmail, profileLoading } = useSocialLayer()
  const [events, setEvents] = useState<any>([])
  const [profile, setProfile] = useState<ProfileData | null>(null)
  
  useEffect(() => {
    const fetchEvents = async () => {
      const events = await getEventsFromEmail(userData?.primary_email ?? "")
      setEvents(events)
    }
    const fetchProfile = async () => {
      const profile = await getProfileFromEmail(userData?.primary_email ?? "")
      setProfile(profile[0])
    }
    if(!userData?.primary_email || userData?.primary_email === "") return

    fetchEvents()
    fetchProfile()
  }, [userData?.primary_email])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <Card className="p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold text-gray-900">Event Statitics</h2>
          <p className="text-sm text-gray-600">Your event participation breakdown (from the Social Layer community calendar).</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-md font-semibold text-gray-700">Events Hosted</p>
              {profileLoading ? (
                //Skeleton
                <Skeleton className="w-12 h-12 rounded-lg" />
              ) : (
                <div className="px-[6px] py-[4px] bg-gray-100 rounded-md">
                  <p className="text-sm font-bold text-gray-600 leading-none">{profile?.events?.length ?? 0}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {(profile?.events || []).slice(-3).reverse().map((event, index) => (
              <div key={`hosted-${event.id}-${index}`} className="flex items-center gap-2 px-2 py-1 rounded-md border border-gray-100">
                <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {event.participants.length} participant{event.participants.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
            {(profile?.events?.length === 0 || !profile?.events) && !profileLoading && (
              <p className="text-xs text-gray-400 italic">No events hosted yet</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-md font-semibold text-gray-700">Events Attended</p>
              {eventsLoading ? (
                //Skeleton
                <Skeleton className="w-12 h-12 rounded-lg" />
              ) : (
                <div className="px-[6px] py-[4px] bg-gray-100 rounded-md">
                  <p className="text-sm font-bold text-gray-600 leading-none">{events.length ?? 0}</p>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {events.slice(-3).reverse().map((event: any, index: any) => (
              <div key={`attended-${event.id}-${index}`} className="flex items-center gap-2 px-2 py-1 rounded-md border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {event.location && event.location.length > 30 
                      ? `${event.location.substring(0, 30)}...` 
                      : event.location || 'Location not specified'}
                  </p>
                </div>
              </div>
            ))}
            {events.length === 0 && !eventsLoading && (
              <p className="text-xs text-gray-400 italic">No events attended yet</p>
            )}
          </div>
        </Card>
      </Card>
      
      <TopMatchStats userData={userData} eventsLoading={eventsLoading} events={events} />
    </div>
  )
}
export default ProfileStats
