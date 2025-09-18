import { CitizenProfile } from "@/types/Profile"
import { House, Calendar, Users, MapPinned, CalendarDays, Speech, CalendarCheck, CalendarCheck2, Calendar1, CalendarPlus } from "lucide-react"
import { Card } from "../ui/card"
import { useSocialLayer } from "@/hooks/useSocialLayer"
import { useEffect, useState, useCallback } from "react"
import { Skeleton } from "../ui/skeleton"
import { Avatar } from "../ui/avatar"
import Image from "next/image"
import { ProfileData } from "@/types/StatsSocialLayer"
import TopMatchStats from "./TopMatchStats"

const StatsCards = ({userData}: {userData: CitizenProfile | null}) => {
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

  console.log('events', events)

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Stats</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6">
        <Card className="p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pop-ups attended</p>
              <p className="text-3xl font-bold text-gray-900">{userData?.popups?.length ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPinned className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Days at Edge</p>
              <p className="text-3xl font-bold text-gray-900">{userData?.total_days ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar1 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Referrals</p>
              <p className="text-3xl font-bold text-gray-900">{userData?.referral_count ?? 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Speech className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Events Attended</p>
              {eventsLoading ? (
                //Skeleton
                <Skeleton className="w-12 h-12 rounded-lg" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{events.length ?? 0}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CalendarCheck2 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {events.slice(-3).reverse().map((event: any, index: any) => (
              <div key={`attended-${event.id}-${index}`} className="flex items-center gap-2 px-2 py-1 rounded-md border border-gray-100">
                <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
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

        <Card className="p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Events Hosted</p>
              {profileLoading ? (
                //Skeleton
                <Skeleton className="w-12 h-12 rounded-lg" />
              ) : (
                <p className="text-3xl font-bold text-gray-900">{profile?.events?.length ?? 0}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <CalendarPlus className="w-6 h-6 text-red-600" />
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
        
        <TopMatchStats userData={userData} eventsLoading={eventsLoading} events={events} />
      </div>
    </div>
  )
}
export default StatsCards