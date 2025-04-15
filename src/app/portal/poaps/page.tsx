import { PoapProps } from "@/types/Poaps"
import Poap from "./components/Poap"
import PoapsList from "./components/PoapsList"

const PoapsPage = () => {
  return (
    <main className="container p-4 md:py-6 mb-8">
      <div className="flex w-full justify-between">
        <div className="flex flex-col md:flex-row md:gap-4 items-center">
          <h1 className='text-2xl font-semibold'>Your Collectibles ·</h1>
          <p className='text-sm text-gray-500'>
            Collect POAPs and other collectibles from Edge City events.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white rounded-2xl p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={'https://simplefi.s3.us-east-2.amazonaws.com/logo_base.png'} alt='poap' width={18} height={18} />
          <p className='text-sm font-medium text-muted-foreground'>Our POAPs are minted on Base</p>
        </div>
      </div>

      <PoapsList />
    
    </main>
  )
}
export default PoapsPage