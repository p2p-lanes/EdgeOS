import { Button, ButtonAnimated } from "@/components/ui/button"
import { useState } from "react"
import useDiscountCode from "../../hooks/useDiscountCode"
import { Input } from "@/components/ui/input"
import { Loader2, XCircle } from "lucide-react"
import { CheckCircle } from "lucide-react"

const DiscountCode = ({defaultOpen = false}: {defaultOpen?: boolean}) => {
  const [open, setOpen] = useState(defaultOpen)
  const [discountCode, setDiscountCode] = useState('')
  const { getDiscountCode, loading, discountMsg, validDiscount, clearDiscountMessage } = useDiscountCode()

  const handleApplyDiscount = () => {
    getDiscountCode(discountCode)
  }

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountCode(e.target.value)
    clearDiscountMessage()
  }

  return (
    <div className="flex px-0 gap-4">
      <p className="text-sm font-medium underline whitespace-nowrap cursor-pointer my-2" onClick={() => setOpen(!open)}>Have a coupon?</p>
      {
        open ? (
          <div className="flex flex-col items-start gap-2">
            <div className="flex items-start gap-4">
              <Input
                disabled={loading || validDiscount}
                error={!validDiscount && !!discountMsg && discountCode.length > 0 ? discountMsg : ''}
                placeholder="Enter coupon code" 
                className="bg-white text-black"
                data-discount-code={discountCode}
                value={discountCode.toUpperCase()}
                onChange={handleDiscountChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && discountCode.length > 0 && !loading) {
                    handleApplyDiscount()
                  }
                }}
                autoFocus
              />
              <Button
                variant="secondary"
                className="hover:no-underline font-bold text-[#7F22FE] bg-[#7F22FE]/10"
                onClick={handleApplyDiscount}
                disabled={discountCode.length === 0 || loading || validDiscount}
              >
                {
                  loading && <Loader2 className="size-4 animate-spin" />
                }

                Apply 
            </Button>
            </div>
            {
              !loading && discountCode.length > 0 && (discountMsg || validDiscount) && (
                <p className={`flex items-center gap-1 text-xs ${validDiscount ? 'text-green-500' : 'text-red-500'}`}>
                  {validDiscount ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  {validDiscount ? 'Coupon code applied successfully.' :  discountMsg}
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