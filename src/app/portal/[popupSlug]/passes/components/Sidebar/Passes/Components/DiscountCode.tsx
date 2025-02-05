import { Button } from "@/components/ui/button"
import { useState } from "react"
import useDiscountCode from "../../../../hooks/useDiscountCode"
import { Input } from "@/components/ui/input"
import { XCircle } from "lucide-react"
import { CheckCircle } from "lucide-react"

const DiscountCode = () => {
  const [open, setOpen] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const { getDiscountCode, loading, discountMsg, validDiscount } = useDiscountCode()

  const handleApplyDiscount = () => {
    getDiscountCode(discountCode)
  }

  return (
    <div className="flex px-0 gap-4">
      <p className="text-sm font-medium underline whitespace-nowrap cursor-pointer my-2" onClick={() => setOpen(!open)}>Have a coupon?</p>
      {
        open ? (
          <div className="flex flex-col w-full items-start gap-2">
            <div className="flex w-full items-start gap-4">
              <Input
                disabled={loading || validDiscount}
                error={!validDiscount && !!discountMsg ? discountMsg : ''}
                placeholder="Enter coupon code" 
                data-discount-code={discountCode}
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && discountCode.length > 0 && !loading) {
                    handleApplyDiscount()
                  }
                }}
              />
              <Button
                variant="secondary"
                className="hover:no-underline font-bold text-[#7F22FE] bg-[#7F22FE]/10"
                onClick={handleApplyDiscount}
                disabled={discountCode.length === 0 || loading || validDiscount}
              >
              Apply 
            </Button>
            </div>
            {
              !loading && (discountMsg || validDiscount) && (
                <p className={`flex items-center gap-1 text-xs ${validDiscount ? 'text-green-500' : 'text-red-500'}`}>
                  {validDiscount ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  {validDiscount ? 'Coupon code applied successfully.' : discountMsg}
                </p>
              )
            }
          </div>
        ) : null
      }
    </div>
  )
}

export default DiscountCode