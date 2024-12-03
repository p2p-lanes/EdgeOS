"use client"

import { Loader } from "@/components/ui/Loader"
import { useCityProvider } from "@/providers/cityProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const Page = () => {
  const { getCity } = useCityProvider()
  const city = getCity()
  const router = useRouter()

  useEffect(() => {
    if(city){
      router.push(`/portal/${city.slug}`)
    }
  }, [city])

  return (
    <div className="w-full h-full">
      <Loader/>
    </div>
  )
}
export default Page