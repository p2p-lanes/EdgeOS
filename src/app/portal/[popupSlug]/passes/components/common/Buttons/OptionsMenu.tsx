import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/Sidebar/DropdownMenu"
import { MoreVertical, Pencil, Trash } from "lucide-react"

const OptionsMenu = ({onEdit, onDelete, className}: {onEdit: () => void, onDelete?: () => void, className?: string}) => {
  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="hover:bg-gray-100 rounded-md">
          <MoreVertical className="w-5 h-5 my-2 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-md"/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-fit">
          <DropdownMenuGroup className="flex flex-col gap-2">
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer justify-between">
              Edit
              <Pencil className="w-4 h-4 text-gray-500"/>
            </DropdownMenuItem>

            {
              onDelete && (
                <DropdownMenuItem onClick={onDelete} className="cursor-pointer justify-between">
                  Delete
                  <Trash className="w-4 h-4 text-red-500"/>
                </DropdownMenuItem>
              )
            }
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
export default OptionsMenu