import { usePassesProvider } from "@/providers/passesProvider"
import { useTotal } from "@/providers/totalProvider"

const BalancePasses = () => {
  const { total, balance } = useTotal()
  const { isEditing } = usePassesProvider()

  if(!isEditing) return null
  
  return (
    <div className="flex items-center gap-4 w-fit">
      <span className="text-2xl font-semibold">Balance: </span>
      <span className="text-2xl font-semibold text-neutral-500">{balance >= 0 ? `$0` : ` $${-balance}`}</span>
    </div>
  )
}
export default BalancePasses