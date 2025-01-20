import { useMemo } from "react"
import { AttendeeProps } from "@/types/Attendee"
import { calculateTotal } from "../helpers/products"
import { useCityProvider } from "@/providers/cityProvider"

export const usePasses = (attendeePasses: AttendeeProps[]) => {
  const { getAttendees } = useCityProvider()
  const attendees = getAttendees()
  const total = useMemo(() => calculateTotal(attendeePasses), [attendeePasses])
  const specialProduct = attendeePasses.find(a => a.category === 'main')?.products.find(p => p.category === 'patreon')
  const hasSelectedWeeks = false;
  const mainAttendee = attendees.find(a => a.category === 'main')
  
  const disabledPurchase = !hasSelectedWeeks || (
    specialProduct?.selected && 
    mainAttendee?.products?.length === 0 
    // && products.filter(p => p.category !== 'patreon' && p.selected).length === 0
  )
  
  const specialPurchase = mainAttendee?.products?.some(p => p.category === 'patreon')

  return {
    total,
    specialProduct,
    hasSelectedWeeks,
    mainAttendee,
    disabledPurchase,
    specialPurchase
  }
}