"use client"

import { Loader } from "@/components/ui/Loader"
import { useCityProvider } from "@/providers/cityProvider"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

const Page = () => {
  const { getCity } = useCityProvider()
  const city = getCity()
  const router = useRouter()
  const params = useSearchParams()
  const popupSlug = params.get('popup')

  useEffect(() => {
    if(popupSlug){
      router.push(`/portal/${popupSlug}`)
      return;
    }
    
    if(city){
      router.push(`/portal/${city.slug}`)
    }
  }, [city, popupSlug])

  return (
    <div className="w-full h-full">
      <Loader/>
    </div>
  )
}
export default Page