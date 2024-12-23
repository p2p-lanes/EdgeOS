import { cn } from "@/lib/utils"
import { ProductsPass } from "@/types/Products"
import { DollarSign, Plus } from "lucide-react"

const SelectFullMonth = ({product, onClick}: {product?: ProductsPass, onClick: () => void}) => {

  if(!product) return null

  return (
    <div className="flex justify-center">
      <button
        onClick={onClick}
      className="relative p-[2px] inline-flex items-center rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 group"
    >
      <span className={cn("flex items-center gap-2 relative px-4 py-1 text-sm font-medium text-black bg-white rounded-full group-hover:bg-opacity-90", product.selected && "bg-primary/10")}>
      <Plus className="text-primary w-4 h-4 text-gray-500"/>
         Select Full Month and Save
      <DollarSign className="w-4 h-4 text-gray-500 text-primary"/> 
      </span>
    </button>
    </div>
  )
}
export default SelectFullMonth