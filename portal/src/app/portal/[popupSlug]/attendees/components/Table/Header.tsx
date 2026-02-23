import { Ticket } from "lucide-react"
import { TableHead, TableHeader, TableRow } from "@/components/ui/table"

const Header = () => {
  return (
    <TableHeader>
      <TableRow className="border-b border-gray-200 bg-white">
        <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap min-w-[200px]">
          Attendee
        </TableHead>
        <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap min-w-[200px]">
          Email
        </TableHead>
        <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap min-w-[150px]">
          Telegram Username
        </TableHead>
        <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap flex items-center gap-2 min-w-[150px]">
          <Ticket className="h-5 w-5" />
          Weeks joining
        </TableHead>
        <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap min-w-[100px]">
          I'm bringing kids
        </TableHead>
        <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap min-w-[150px]">
          Role
        </TableHead>
        <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap min-w-[200px]">
          Organization
        </TableHead>
      </TableRow>
    </TableHeader>
  )
}
export default Header
