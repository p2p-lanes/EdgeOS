import { AttendeeDirectory } from "@/types/Attendee"
import CellControl from "../../CellControl"
import { TableCell } from "@/components/ui/table"

const AttendeeCell = ({attendee, className}: {attendee: AttendeeDirectory, className?: string}) => {
  return (
    <TableCell className={className}>
      <div className="flex items-center gap-1">
        <CellControl className="font-medium text-gray-900" value={attendee.first_name}>
          {attendee.first_name}
      </CellControl>
      <CellControl className="font-medium text-gray-900" value={attendee.last_name}>
        {attendee.last_name}
        </CellControl>
      </div>
    </TableCell>
  )
}
export default AttendeeCell