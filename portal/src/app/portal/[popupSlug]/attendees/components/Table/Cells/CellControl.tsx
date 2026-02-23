import { EyeOff } from "lucide-react"
import type { ProductsPass } from "@/types/Products"

const CellControl = ({
  children,
  value,
  className,
}: {
  children: React.ReactNode
  value: string | boolean | ProductsPass[]
  className?: string
}) => {
  if (value === "*") {
    return <EyeOff className="w-4 h-4" />
  }

  return <div className={className}>{children}</div>
}
export default CellControl
