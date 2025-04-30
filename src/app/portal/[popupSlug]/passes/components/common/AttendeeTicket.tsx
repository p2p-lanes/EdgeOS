import { AttendeeProps } from "@/types/Attendee"
import { Pencil, QrCode, Trash, User } from "lucide-react"
import { badgeName } from "../../constants/multiuse"
import { ProductsPass } from "@/types/Products"
import { useCityProvider } from "@/providers/cityProvider"
import { EdgeLand } from "@/components/Icons/EdgeLand"
import Product from "./Products/ProductTicket"
import useModal from "../../hooks/useModal"
import useAttendee from "@/hooks/useAttendee"
import { AttendeeModal } from "../AttendeeModal"
import OptionsMenu from "./Buttons/OptionsMenu"
import { TooltipContent } from "@/components/ui/tooltip"
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip"
import { TooltipProvider } from "@/components/ui/tooltip"

const AttendeeTicket = ({attendee, toggleProduct}: {attendee: AttendeeProps, toggleProduct?: (attendeeId: number, product: ProductsPass) => void}) => {
  const standardProducts = attendee.products.filter((product) => product.category !== 'patreon' && product.category !== 'month')
  const { getCity } = useCityProvider()
  const city = getCity()
  const { handleEdit, handleCloseModal, modal, handleDelete } = useModal()
  const { removeAttendee, editAttendee } = useAttendee()
  const hasPurchased = attendee.products.some((product) => product.purchased)


  const handleEditAttendee = () => {
    handleEdit(attendee)
  }

  const handleSubmit = async (data: AttendeeProps) => {
    if (modal.isDelete) {
      await removeAttendee(attendee.id)
    }else {
      await editAttendee(attendee.id, data)
    }
    handleCloseModal()
  }

  const handleRemoveAttendee = () => {
    handleDelete(attendee)
  }

  return (
    <div className="relative h-full w-full">
      <div className="w-full overflow-hidden">
        <div className="w-full rounded-3xl border border-gray-200 h-full xl:grid xl:grid-cols-[1fr_2px_2fr] bg-white">

          <div className="relative flex flex-col p-6 overflow-hidden h-full">
            <div 
              className="absolute inset-0 z-0 rounded-3xl"
              style={{
                background: `linear-gradient(0deg, transparent, rgba(255, 255, 255, 0.8) 20%, #FFFFFF 90%), url(${city?.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'top',
              }}
            />
            <div className="z-10 h-full flex xl:flex-col justify-between xl:justify-start xl:gap-10">
              <div className="flex flex-col justify-center xl:order-2">
                <p className="text-xl font-semibold">{attendee.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-500"/>
                  <p className="text-sm text-gray-500">{badgeName[attendee.category] || attendee.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 xl:order-1">
                  <EdgeLand/>
                  <p className="text-sm font-medium">{city?.name}</p>
                </div>
              </div>

              <OptionsMenu onEdit={handleEditAttendee} onDelete={hasPurchased ? undefined : handleRemoveAttendee} className="absolute top-1 right-4 xl:hidden"/>
            </div>

          </div>

          <div className="border-r-2 border-dashed border-gray-200 self-stretch relative">
            <div className="absolute -top-[23px] -left-[23px] w-[48px] h-[46px] bg-neutral-100 rounded-3xl border border-gray-200"></div>
            <div className="absolute max-xl:-top-[23px] max-xl:-right-[23px] xl:-bottom-[23px] xl:-right-auto xl:-left-[23px] w-[48px] h-[46px] bg-neutral-100 rounded-3xl border border-gray-200"></div> 
          </div>

          <div className="flex flex-col p-8 gap-2 xl:pr-10">
            {
              standardProducts.length === 0 && (
                <div className="flex w-full h-full justify-center items-center">
                  <p className="text-sm font-medium text-neutral-500">No tickets available.</p>
                </div>
              )
            }
            {
              standardProducts.map((product) => (
                <Product 
                  key={`${product.id}-${attendee.id}`} 
                  product={product} 
                  defaultDisabled={!toggleProduct} 
                  onClick={toggleProduct ? (attendeeId, product) => toggleProduct(attendeeId ?? 0, product) : () => {}}
                />
              ))
            }
            {
              !hasPurchased && (
                <OptionsMenu onEdit={handleEditAttendee} onDelete={handleRemoveAttendee} className="absolute top-2 right-3 hidden xl:flex"/>
              )
            }


        {
          hasPurchased && (
            <div className="flex w-full justify-end">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 p-2">
                      <p className="text-sm font-medium text-muted-foreground">Check-in Code</p>
                      <QrCode className="w-5 h-5 text-gray-500"/>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-white text-black max-w-[420px] border border-gray-200">
                    <p className="text-sm text-gray-600">Closer to the event, you will be able to download your check-in code here.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        }
          </div>
        </div>
      </div>

      {(modal.isOpen) && (
        <AttendeeModal
          open={modal.isOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          category={modal.category!}
          editingAttendee={modal.editingAttendee}
          isDelete={modal.isDelete}
        />
      )}
    </div>
  )
}

export default AttendeeTicket