import PoapsList from "./components/PoapsList"

const PoapsPage = () => {
  return (
    <main className="container max-w-5xl mx-auto p-6 h-full">
      <div className="flex flex-col gap-4">
        <h1 className='text-2xl font-semibold'>Your Collectibles</h1>
        <div className="flex flex-col">
          <p className='text-sm text-gray-500'>
            Digital collectibles (also called POAPs) are digital souvenirs to remember special moments. Think of them as digital badges proving you were there—like stamps in a passport that you keep forever.
          </p>
          <p className='text-sm text-gray-500'>
             Who knows? Someday it might feel special to show that you were part of experience from the very start.
          </p>
        </div>
      </div>

      <PoapsList />
    
    </main>
  )
}
export default PoapsPage