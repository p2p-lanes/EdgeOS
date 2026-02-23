import { useDiscount } from "@/providers/discountProvider"

const useCompareDiscount = () => {
  const { discountApplied } = useDiscount()

  const compareDiscount = (discount: number) => {
    if (
      !discountApplied.discount_value ||
      discount > discountApplied.discount_value
    )
      return { discount_value: discount, is_best: true }

    return { discount_value: discountApplied.discount_value, is_best: false }
  }

  return { compareDiscount }
}
export default useCompareDiscount
