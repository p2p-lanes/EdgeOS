import Pagination from "@/components/common/Pagination"
import ParticipationTickets from "@/components/common/ParticipationTickets"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useProductsQuery } from "@/hooks/useProductsQuery"
import { useCityProvider } from "@/providers/cityProvider"
import type { AttendeeDirectory } from "@/types/Attendee"
import type { ProductsPass } from "@/types/Products"
import AttendeeCell from "./Table/Cells/AttendeeCell"
import CellControl from "./Table/Cells/CellControl"
import CommonCell from "./Table/Cells/CommonCell"
import Header from "./Table/Header"
import "./Table/Cells/styles.css"

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
  const { getCity } = useCityProvider()
  const city = getCity()
  const { data: products = [] } = useProductsQuery(
    city ? String(city.id) : null,
  )

  if (attendees.length === 0 && !loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-center text-muted-foreground">No attendees found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full mt-4">
      <Table>
        <Header />
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-[530px]">
                <div className="flex justify-center items-center h-full">
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-primary rounded-full animate-spin" />
                </div>
              </TableCell>
            </TableRow>
          ) : (
            attendees.map((attendee, index) => (
              <TableRow
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 bg-white sticky z-10 left-0"
              >
                <AttendeeCell attendee={attendee} />
                <CommonCell value={attendee.email ?? ""} />
                <CommonCell value={attendee.telegram ?? ""} />
                <TableCell>
                  <CellControl
                    value={attendee.participation as unknown as ProductsPass[]}
                  >
                    <ParticipationTickets
                      participation={
                        attendee.participation as unknown as ProductsPass[]
                      }
                      passes={products}
                    />
                  </CellControl>
                </TableCell>
                <CommonCell
                  value={
                    attendee.brings_kids === "*"
                      ? "*"
                      : attendee.brings_kids
                        ? "Yes"
                        : "No"
                  }
                />
                <CommonCell
                  value={
                    attendee.role && attendee.role?.length > 60
                      ? `${attendee.role.slice(0, 60)}...`
                      : (attendee.role ?? "")
                  }
                />
                <CommonCell
                  value={
                    attendee.organization && attendee.organization?.length > 80
                      ? `${attendee.organization.slice(0, 80)}...`
                      : (attendee.organization ?? "")
                  }
                />
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination
        currentPage={currentPage}
        onPageChange={onPageChange}
        totalPages={Math.ceil(totalAttendees / pageSize)}
      />
    </div>
  )
}

export default AttendeesTable
