"use client"

import { Loader } from "@/components/ui/Loader"
import { useCityProvider } from "@/providers/cityProvider"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar } from "lucide-react"

const Page = () => {
  const { getCity, getPopups, popupsLoaded } = useCityProvider()
  const city = getCity()
  const router = useRouter()
  const params = useSearchParams()
  const popupSlug = params.get('popup')

  useEffect(() => {
    if(popupSlug){
      console.log("popupSlug", popupSlug)
      router.push(`/portal/${popupSlug}`)
      return;
    }
    
    // if(city){
    //   router.push(`/portal/${city.slug}`)
    // }
  }, [city, popupSlug, router])

  const hasActivePopups = getPopups().some(p => p.clickable_in_portal && p.visible_in_portal)

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
                There are no active popups available at the moment. Please check back later.
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <Loader/>
    </div>
  )
}
export default Page
