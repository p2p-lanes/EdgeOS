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
    <div className="flex px-2 gap-4">
      <p className="text-sm font-medium underline whitespace-nowrap cursor-pointer" onClick={() => setOpen(!open)}>Have a coupon?</p>
      {
        open ? (
          <>
            <div className="flex flex-col w-full items-start gap-2">
              <Input
                placeholder="Enter discount code" 
                data-discount-code={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && discountCode.length > 0 && !loading) {
                    handleApplyDiscount()
                  }
                }}
              />
              {
                !loading && (discountMsg || validDiscount) && (
                  <p className={`flex items-center gap-1 text-xs text-muted-foreground ${validDiscount ? 'text-green-500' : 'text-red-500'}`}>
                    {validDiscount ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    {validDiscount ? 'Congrats! Coupon discount applied successfully' : discountMsg}
                  </p>
                )
              }
            </div>
            <Button
              variant="link"
              onClick={handleApplyDiscount} 
              disabled={discountCode.length === 0 || loading}
            >
              Apply 
            </Button>
          </>
        ) : null
      }
    </div>
  )
}

export default DiscountCode