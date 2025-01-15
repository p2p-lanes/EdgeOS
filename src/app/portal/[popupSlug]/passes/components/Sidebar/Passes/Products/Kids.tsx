import { Ticket } from "lucide-react"
import Standard from "./Standard"
import { ProductsPass } from "@/types/Products"
import { Separator } from "@/components/ui/separator"

const Kids = ({product, onClick, disabled, selected, purchased}: {product: ProductsPass, onClick: () => void, disabled: boolean, selected: boolean, purchased: boolean}) => {
  return (
    <div>
      <Separator className="my-4"/>
      
      <Standard
        product={product}
        onClick={onClick}
        disabled={disabled}
        iconTitle={Ticket}
        selected={selected}
        purchased={purchased}
        isSpecial={true}
      />
    </div>
  )
}
export default Kids