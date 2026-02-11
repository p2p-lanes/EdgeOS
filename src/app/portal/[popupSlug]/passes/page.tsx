'use client'
import usePermission from './hooks/usePermission'
import YourPasses from "./components/YourPasses"
import { usePassesProvider } from "@/providers/passesProvider"
import { Loader } from "@/components/ui/Loader"
import { useRouter, useParams } from "next/navigation"

export default function HomePasses() {
  usePermission()

  const router = useRouter()
  const params = useParams()
  const popupSlug = params.popupSlug as string
  const { attendeePasses: attendees, products } = usePassesProvider()

  if(!attendees.length || !products.length) return <Loader />

  const handleBuyPasses = () => {
    router.push(`/portal/${popupSlug}/buy`)
  }

  return (
    <div className="w-full min-h-screen bg-[#F5F5F7]">
      <div className="w-full md:mt-0 mx-auto items-center max-w-3xl p-6">
        <YourPasses onSwitchToBuy={handleBuyPasses} />
      </div>
    </div>
  )
}

