import { ApiError, CouponsService } from "@edgeos/api-client"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import useCompareDiscount from "@/hooks/useCompareDiscount"
import { useCityProvider } from "@/providers/cityProvider"
import { useDiscount } from "@/providers/discountProvider"

const useDiscountCode = () => {
  const [discountMsg, setDiscountMsg] = useState("")
  const [validDiscount, setValidDiscount] = useState(false)
  const { getCity } = useCityProvider()
  const { setDiscount, discountApplied } = useDiscount()
  const { compareDiscount } = useCompareDiscount()

  const mutation = useMutation({
    mutationFn: async (discountCode: string) => {
      const city = getCity()
      if (!city?.id) throw new Error("No city selected")
      return CouponsService.validateCoupon({
        requestBody: {
          popup_id: String(city.id),
          code: discountCode.toUpperCase(),
        },
      })
    },
    onSuccess: (result) => {
      const city = getCity()
      const newDiscount = compareDiscount(result.discount_value ?? 0)
      if (newDiscount.is_best) {
        setDiscount({
          discount_value: newDiscount.discount_value,
          discount_type: "percentage",
          discount_code: result.code,
          city_id: city!.id,
        })
        setDiscountMsg("")
        setValidDiscount(true)
        return
      }
      setDiscountMsg(
        "You already have a higher discount than this coupon. Please, try another one.",
      )
      setValidDiscount(false)
    },
    onError: (error: unknown) => {
      const detail =
        error instanceof ApiError
          ? ((error.body as any)?.detail ?? "Invalid coupon code")
          : "Invalid coupon code"
      setDiscountMsg(detail)
      setValidDiscount(false)
    },
  })

  const getDiscountCode = async (discountCode: string) => {
    mutation.mutate(discountCode)
  }

  const clearDiscountMessage = () => {
    setDiscountMsg("")
  }

  return {
    getDiscountCode,
    loading: mutation.isPending,
    discountMsg,
    validDiscount,
    discountApplied,
    clearDiscountMessage,
  }
}

export default useDiscountCode
