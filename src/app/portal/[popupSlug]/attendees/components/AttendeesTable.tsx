import {Table, TableBody, TableCell, TableRow} from "@/components/ui/table"
import { AttendeeDirectory } from "@/types/Attendee"
import ParticipationTickets from "./Table/Cells/ParticipationTickets"
import Header from "./Table/Header"
import AttendeeCell from "./Table/Cells/AttendeeCell"
import CommonCell from "./Table/Cells/CommonCell"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import useGetPassesData from "@/hooks/useGetPassesData"
import PaginationControls from "./Pagination"
import Pagination from "@/components/common/Pagination"

type AttendeesTableProps = {
  attendees: AttendeeDirectory[]
  loading: boolean
  totalAttendees: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const AttendeesTable = ({ 
  attendees, 
  loading, 
  totalAttendees, 
  currentPage, 
  pageSize, 
  onPageChange,
}: AttendeesTableProps) => {
  const { products: productsPasses } = useGetPassesData()

  // if(loading) {
  //   return (
  //     <div className="flex justify-center items-center h-full">
  //       <div className="w-6 h-6 border-2 border-gray-400 border-t-primary rounded-full animate-spin"></div>
  //     </div>
  //   )
  // }

  if(attendees.length === 0 && !loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-center text-muted-foreground">No attendees found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full mt-4">
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <Table>
          <Header />
          <TableBody>
           {
              loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-[530px]">
                    <div className="flex justify-center items-center h-full">
                      <div className="w-6 h-6 border-2 border-gray-400 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                attendees.map((attendee, index) => (
                  <TableRow key={index} className="border-b border-gray-100 hover:bg-gray-50 bg-white">
                    <AttendeeCell attendee={attendee} />
                  <CommonCell value={attendee.email ?? ''} />
                  <CommonCell value={attendee.telegram ?? ''} />
                  <ParticipationTickets participation={attendee.participation} passes={productsPasses}/>
                  <CommonCell value={attendee.brings_kids === '*' ? '*' : attendee.brings_kids ? "Yes" : "No"} />
                  <CommonCell value={attendee.role && attendee.role?.length > 60 ? `${attendee.role.slice(0, 60)}...` : attendee.role ?? ''} />
                  <CommonCell value={attendee.organization && attendee.organization?.length > 80 ? `${attendee.organization.slice(0, 80)}...` : attendee.organization ?? ''} />
                </TableRow>
              ))
            )
          }
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" className="w-[80%]"/>
      </ScrollArea>

      <Pagination
        currentPage={currentPage}
        onPageChange={onPageChange}
        totalPages={Math.ceil(totalAttendees / pageSize)}
      />
    </div>
  )
}

export default AttendeesTable