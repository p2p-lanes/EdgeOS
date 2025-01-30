import { Button } from "@/components/ui/button"
import { useState } from "react"
import useDiscountCode from "../../../../hooks/useDiscountCode"
import { Input } from "@/components/ui/input"

const DiscountCode = () => {
  const [discountCode, setDiscountCode] = useState('')
  const { getDiscountCode, loading } = useDiscountCode()

  const handleApplyDiscount = () => {
    getDiscountCode(discountCode)
  }

  return (
    <div className="flex gap-4 pt-2 pb-4 px-2">
      {/* <span className="text-sm font-medium text-muted-foreground">Discount code</span> */}
      <Input
        variant="standard"
        placeholder="Enter discount code" 
        onChange={(e) => setDiscountCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && discountCode.length > 0 && !loading) {
            handleApplyDiscount()
          }
        }}
      />
      <Button
        variant="outline"
        onClick={handleApplyDiscount} 
        disabled={discountCode.length === 0 || loading}
      >
        Apply
      </Button>
    </div>
  )
}

export default DiscountCode