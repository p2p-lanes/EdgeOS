"use client"

import { Calendar } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Loader } from "@/components/ui/Loader"
import { useCityProvider } from "@/providers/cityProvider"

const Page = () => {
  const { getCity, getPopups, popupsLoaded } = useCityProvider()
  const router = useRouter()
  const params = useSearchParams()
  const popupSlug = params.get("popup")

  useEffect(() => {
    if (popupSlug) {
      router.push(`/portal/${popupSlug}`)
      return
    }

    const city = getCity()
    if (popupsLoaded && city) {
      router.push(`/portal/${city.slug}`)
    }
  }, [popupSlug, popupsLoaded, getCity, router])

  // LEGACY: clickable_in_portal, visible_in_portal removed – popups are pre-filtered by status === 'active'
  const hasActivePopups = getPopups().length > 0

  if (popupsLoaded && !hasActivePopups && !popupSlug) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <div className="p-3 bg-muted rounded-full">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <CardTitle>No Active Popups</CardTitle>
              <CardDescription>
                There are no active popups available at the moment. Please check
                back later.
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <Loader />
    </div>
  )
}
export default Page
