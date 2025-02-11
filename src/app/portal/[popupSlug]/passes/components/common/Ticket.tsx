import { AttendeeProps } from "@/types/Attendee"
import { QrCode, User } from "lucide-react"
import { badgeName } from "../../constants/multiuse"
import { ProductsPass } from "@/types/Products"
import { useCityProvider } from "@/providers/cityProvider"
import { EdgeLand } from "@/components/Icons/EdgeLand"
import { Button } from "@/components/ui/button"
import Product from "./ProductTicket"

const Ticket = ({attendee, toggleProduct}: {attendee: AttendeeProps, toggleProduct: (attendeeId: number, product: ProductsPass) => void}) => {
  const standardProducts = attendee.products.filter((product) => product.category !== 'patreon' && product.category !== 'month')
  const { getCity} = useCityProvider()
  const city = getCity()

  return (
    <div className="w-full overflow-hidden">
      <div className="w-full rounded-3xl border border-gray-200 h-full grid grid-cols-[1fr_2px_2fr]">

        <div className="relative flex flex-col p-6 overflow-hidden h-full">
          <div 
            className="absolute inset-0 z-0 rounded-3xl "
            style={{
              background: `linear-gradient(0deg, transparent, rgba(255, 255, 255, 0.8) 40%, #FFFFFF 82%), url(${city?.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'top',
            }}
          />
          <div className="z-10 h-full">
            <div className="flex items-center gap-2">
              <EdgeLand/>
              <p className="text-sm font-medium">{city?.name}</p>
            </div>
            <div className="flex flex-col justify-center h-[70%]">
              <p className="text-xl font-semibold">{attendee.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-gray-500"/>
                <p className="text-sm text-gray-500">{badgeName[attendee.category] || attendee.category}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-r-2 border-dashed border-gray-200 self-stretch relative">
          <div className="absolute -top-[23px] -left-[23px] w-[48px] h-[46px] bg-white rounded-3xl border border-gray-200"></div>
          <div className="absolute -bottom-[23px] -left-[23px] w-[48px] h-[46px] bg-white rounded-3xl border border-gray-200"></div> 
        </div>

        <div className="flex flex-col p-8 gap-2">
          {
            standardProducts.map((product) => (
              <Product key={`${product.id}-${attendee.id}`} product={product} onClick={() => toggleProduct(attendee.id, product)}/>
            ))
          }

          {/* <div className="flex w-full justify-end">
            <Button variant={'ghost'} >
              <p className="text-sm font-medium">Check-in Code</p>
              <QrCode className="w-5 h-5 text-gray-500"/>
            </Button>
          </div> */}

        </div>
      </div>
    </div>


  )
}

export default Ticket