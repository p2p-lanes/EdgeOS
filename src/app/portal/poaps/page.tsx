import Poap from "@/components/common/Poap"
import { PoapProps } from "@/types/Poaps"

const POAPS: PoapProps[] = [
  {
    id: 1,
    title: "Edge Esmeralda 2025",
    location: "California, USA",
    status: "mint",
    image: "https://simplefi.s3.us-east-2.amazonaws.com/poaps/poap_2.png",
    link: "https://poap.xyz/mint/dh74us"
  },
  {
    id: 2,
    title: "Edge Esmeralda 2025",
    location: "California, USA",
    status: "minted",
    image: "https://simplefi.s3.us-east-2.amazonaws.com/poaps/poap_1.png"
  },
  {
    id: 3,
    title: "Edge Esmeralda 2025",
    location: "California, USA",
    status: "disabled",
    image: "https://simplefi.s3.us-east-2.amazonaws.com/poaps/poap_2.png"
  }
]

const PoapsPage = () => {
  return (
    <main className="container p-4 md:py-6 mb-8">
      <div className="flex w-full justify-between">
        <div className="flex flex-col md:flex-row md:gap-4 items-center">
          <h1 className='text-2xl font-semibold'>Collect our POAPs ·</h1>
          <p className='text-sm text-gray-500'>
            check our beautiful collection
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white rounded-2xl p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={'https://simplefi.s3.us-east-2.amazonaws.com/logo_linea.png'} alt='poap' width={18} height={18} />
          <p className='text-sm font-medium text-muted-foreground'>Our POAPs are minted on Linea</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 mt-6 mx-2">
        {
          POAPS.map((poap: PoapProps) => (
            <Poap key={poap.id} poap={poap}/>
          ))
        }
      </div>
    
    </main>
  )
}
export default PoapsPage