import PoapsList from "./components/PoapsList"

const PoapsPage = () => {
  return (
    <main className="container max-w-5xl mx-auto p-6">
      <div className="flex flex-col xl:flex-row gap-4 xl:justify-between">
        <div className="flex flex-col xl:flex-row gap-2 xl:items-center xl:gap-4">
          <h1 className='text-2xl font-semibold'>Your Collectibles</h1>
          <h1 className='text-2xl font-semibold xl:block hidden'>·</h1>
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