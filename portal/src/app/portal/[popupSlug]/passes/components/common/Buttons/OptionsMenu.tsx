import { MoreVertical, Pencil, Trash } from "lucide-react"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/Sidebar/DropdownMenu"

const OptionsMenu = ({
  onEdit,
  onDelete,
  className,
}: {
  onEdit: () => void
  onDelete?: () => void
  className?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleEdit = () => {
    setIsOpen(false) // Cerrar el dropdown antes de ejecutar la acción
    onEdit()
  }

  const handleDelete = () => {
    setIsOpen(false) // Cerrar el dropdown antes de ejecutar la acción
    onDelete?.()
  }

  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild className="hover:bg-gray-100 rounded-md">
          <MoreVertical className="w-5 h-5 my-2 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-fit">
          <DropdownMenuGroup className="flex flex-col gap-2">
            <DropdownMenuItem
              onClick={handleEdit}
              className="cursor-pointer justify-between"
            >
              Edit
              <Pencil className="w-4 h-4 text-gray-500" />
            </DropdownMenuItem>

            {onDelete && (
              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer justify-between"
              >
                Delete
                <Trash className="w-4 h-4 text-red-500" />
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
export default OptionsMenu
