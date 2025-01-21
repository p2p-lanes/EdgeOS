import { useMemo } from "react"
import { AttendeeProps } from "@/types/Attendee"
import { calculateTotal } from "../helpers/products"

export const usePasses = (attendees: AttendeeProps[]) => {
  const total = useMemo(() => calculateTotal(attendees), [attendees])
  const specialProduct = attendees.find(a => a.category === 'main')?.products.find(p => p.category === 'patreon')
  const hasSelectedWeeks = attendees.some(a => a.products.some(p => p.selected))
  const mainAttendee = attendees.find(a => a.category === 'main')
  
  const disabledPurchase = !hasSelectedWeeks || (
    specialProduct?.selected && 
    mainAttendee?.products?.length === 0 
  )
  
  const specialPurchase = mainAttendee?.products?.some(p => p.category === 'patreon' && p.purchased)

  return {
    total,
    specialProduct,
    hasSelectedWeeks,
    mainAttendee,
    disabledPurchase,
    specialPurchase
  }
}