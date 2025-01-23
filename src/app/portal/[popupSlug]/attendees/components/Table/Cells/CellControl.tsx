import { ProductsProps } from "@/types/Products"
import { EyeOff } from "lucide-react"

const CellControl = ({children, value, className}: {children: React.ReactNode, value: string | boolean | ProductsProps[], className?: string}) => {

  if(value === '*'){
    return(
      <EyeOff className="w-4 h-4" />
    )
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}
export default CellControl