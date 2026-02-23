import { useMemo } from "react"
import { useApplication } from "@/providers/applicationProvider"
import { useCityProvider } from "@/providers/cityProvider"
import { useDiscount } from "@/providers/discountProvider"
import { useGroupsProvider } from "@/providers/groupsProvider"
import type { ProductsPass } from "@/types/Products"

const useCalculateDiscount = (isPatreon: boolean, products: ProductsPass[]) => {
  const { discountApplied } = useDiscount()
  const { getCity } = useCityProvider()
  const _city = getCity()
  const { getRelevantApplication } = useApplication()
  const { groups } = useGroupsProvider()
  const application = getRelevantApplication()
  const productCompare = useMemo(
    () =>
      products.find(
        (p) => p.category === "week" && p.price !== p.compare_price,
      ) ?? { price: 100, compare_price: 100 },
    [products],
  )

  const { discount, label, isEarlyBird } = useMemo(() => {
    if (isPatreon)
      return {
        discount: 100,
        label: "As a Patron, you are directly supporting the ecosystem.",
      }

    if (!application) return { discount: 0, label: "" }

    if (application.group_id && groups.length > 0) {
      const group = groups.find(
        (g: import("@edgeos/api-client").GroupPublic) =>
          g.id === application.group_id,
      )
      if (
        group?.discount_percentage &&
        Number(group.discount_percentage) >= discountApplied.discount_value
      ) {
        return {
          discount: Number(group.discount_percentage),
          label: `You've been awarded a ${group.discount_percentage}% discount from your group. Enjoy!`,
        }
      }
    }

    if (discountApplied.discount_value) {
      // LEGACY: application.discount_assigned was removed from API
      return {
        discount: discountApplied.discount_value,
        label: `You've unlocked an extra ${discountApplied.discount_value}% off with your code. Enjoy!`,
      }
    }

    // LEGACY: city.ticketing_banner_description was removed from API

    const _discount =
      100 -
      ((productCompare.price ?? 0) / (productCompare.compare_price ?? 0)) * 100
    return { discount: 0, label: "", isEarlyBird: false }
    // return {discount: Math.round(discount), label: `${Math.round(discount)}% early bird discount`, isEarlyBird: true}
  }, [isPatreon, application, productCompare, discountApplied, groups])

  return { discount, label, isEarlyBird }
}
export default useCalculateDiscount
