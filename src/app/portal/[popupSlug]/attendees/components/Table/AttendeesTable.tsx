import {
  Table,
  TableBody,
  TableRow,
} from "@/components/ui/table"
import { AttendeeDirectory } from "@/types/Attendee"
import ParticipationTickets from "../ParticipationTickets"
import Header from "./Header"
import AttendeeCell from "./Cells/AttendeeCell"
import CommonCell from "./Cells/CommonCell"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const AttendeesTable = ({ attendees }: { attendees: AttendeeDirectory[] }) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border mt-4">
    <Table>
      <Header />
      
      <TableBody>
        {attendees.map((attendee, index) => (
          <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50">
            <AttendeeCell attendee={attendee} />

            <CommonCell value={attendee.email} />

            <CommonCell value={attendee.telegram} />

            <ParticipationTickets participation={attendee.participation}/>

            <CommonCell value={attendee.bring_kids !== '*' ? attendee.bring_kids ? "Yes" : "No" : '*'} />

            <CommonCell value={attendee.role} />

            <CommonCell value={attendee.organization} />
          </TableRow>
        ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
export default AttendeesTable