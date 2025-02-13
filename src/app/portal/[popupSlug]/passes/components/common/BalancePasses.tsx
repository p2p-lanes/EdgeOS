import { usePassesProvider } from "@/providers/passesProvider"

const BalancePasses = () => {
  const { isEditing } = usePassesProvider()

  if (!isEditing) return <div></div>

  return (
    <div className="flex items-center gap-4 w-fit">
      <span className="text-2xl font-semibold">Balance: </span>
      <span className="text-2xl font-semibold text-neutral-500">$0.00</span>
    </div>
  )
}
export default BalancePasses