import { usePassesProvider } from "@/providers/passesProvider"

const useCompareDiscount = () => {
  const { discountApplied } = usePassesProvider()

  const compareDiscount = (discount: number) => {
    if(!discountApplied.discount_value || discount > discountApplied.discount_value) return {discount_value: discount, is_best: true}

    return {discount_value: discountApplied.discount_value, is_best: false}
  }

  return {compareDiscount}
}
export default useCompareDiscount