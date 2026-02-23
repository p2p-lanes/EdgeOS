import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { sortAttendees } from "@/helpers/filters"
import useGetPassesData from "@/hooks/useGetPassesData"
import { getPriceStrategy } from "@/strategies/PriceStrategy"
import { getProductStrategy } from "@/strategies/ProductStrategies"
import { getPurchaseStrategy } from "@/strategies/PurchaseStrategy"
import type { AttendeePassState } from "@/types/Attendee"
import type { ProductsPass } from "@/types/Products"
import { useApplication } from "./applicationProvider"
import { useCityProvider } from "./cityProvider"
import { useDiscount } from "./discountProvider"

interface PassesContext_interface {
  attendeePasses: AttendeePassState[]
  toggleProduct: (attendeeId: string, product: ProductsPass) => void
  products: ProductsPass[]
  isEditing: boolean
  toggleEditing: (editing?: boolean) => void
}

export const PassesContext = createContext<PassesContext_interface | null>(null)

const PassesProvider = ({ children }: { children: ReactNode }) => {
  const { getAttendees } = useApplication()
  const { discountApplied } = useDiscount()
  const [attendeePasses, setAttendeePasses] = useState<AttendeePassState[]>([])

  const attendees = useMemo(() => {
    const result = sortAttendees(getAttendees())
    return result
  }, [getAttendees])

  const [isEditing, setIsEditing] = useState(false)
  const { products } = useGetPassesData()
  const { getCity } = useCityProvider()
  const _city = getCity()
  // LEGACY: local_resident removed from ApplicationPublic
  const attendeePassesRef = useRef<AttendeePassState[]>([])

  const toggleProduct = useCallback(
    (attendeeId: string, product: ProductsPass) => {
      if (!product) return
      const strategy = getProductStrategy(product, isEditing)
      const updatedAttendees = strategy.handleSelection(
        attendeePasses,
        attendeeId,
        product,
        discountApplied,
      )
      setAttendeePasses(updatedAttendees)
    },
    [attendeePasses, isEditing, discountApplied],
  )

  useEffect(() => {
    if (attendees.length > 0 && products.length > 0) {
      const initialAttendees = attendees.map((attendee) => {
        const hasPatreonPurchased = attendee.products.some(
          (p) => p.category === "patreon",
        )
        const priceStrategy = getPriceStrategy()
        const purchaseStrategy = getPurchaseStrategy()

        const attendeeProducts = products
          .filter(
            (product: ProductsPass) =>
              product.attendee_category === attendee.category &&
              product.is_active,
            // (
            //   localResident
            //     ? (product.category.includes('local'))
            //     : (product.category !== 'local week' && product.category !== 'local month')
            // )
          )
          .map((product: ProductsPass) => {
            const originalQuantity = product.category.includes("day")
              ? (attendees
                  .find((a) => a.id === attendee.id)
                  ?.products.find((p) => p.id === product.id)?.quantity ?? 0)
              : 1
            return {
              ...product,
              original_quantity: originalQuantity,
              quantity: originalQuantity,
              selected:
                attendeePassesRef.current
                  .find((a) => a.id === attendee.id)
                  ?.products.find((p) => p.id === product.id)?.selected ||
                false,
              attendee_id: attendee.id,
              original_price: product.price,
              disabled: false,
              price: priceStrategy.calculatePrice(
                product,
                hasPatreonPurchased,
                discountApplied.discount_value,
              ),
            }
          })

        return {
          ...attendee,
          products: purchaseStrategy.applyPurchaseRules(
            attendeeProducts,
            attendee.products || [],
          ),
        }
      })
      setAttendeePasses(initialAttendees)
    }
  }, [attendees, products, discountApplied])

  useEffect(() => {
    attendeePassesRef.current = attendeePasses
  }, [attendeePasses])

  const toggleEditing = useCallback(
    (editing?: boolean) => {
      setAttendeePasses(
        attendeePasses.map((attendee) => ({
          ...attendee,
          products: attendee.products.map((product) => ({
            ...product,
            edit: false,
            selected: false,
            disabled: false,
          })),
        })),
      )

      setIsEditing(editing !== undefined ? editing : !isEditing)
    },
    [attendeePasses, isEditing],
  )

  // LEGACY: discount_assigned removed from ApplicationPublic

  return (
    <PassesContext.Provider
      value={{
        attendeePasses,
        toggleProduct,
        products,
        isEditing,
        toggleEditing,
      }}
    >
      {children}
    </PassesContext.Provider>
  )
}

export const usePassesProvider = (): PassesContext_interface => {
  const context = useContext(PassesContext)
  if (context === null) {
    throw new Error("usePassesProvider must be used within a PassesProvider")
  }
  return context
}

export default PassesProvider
