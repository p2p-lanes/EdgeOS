'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Ticket } from "lucide-react"
import useGetData from "./hooks/useGetData"
import CellControl from "./components/CellControl"

const Page = () => {
  const { attendees } = useGetData()

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-7xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Attendee Directory</h1>
        <p className="text-sm text-muted-foreground">
          Reach out to your friends to plan dates, find shared housing, or organize activities together. 
          <br />
          *This directory includes only the information of those who have voluntarily opted in to share their details.
        </p>
        
        <div >
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap">Attendee</TableHead>
                <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap">Email</TableHead>
                <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap">Telegram Username</TableHead>
                <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Participation
                  </div>
                </TableHead>
                <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap">I'm bringing kids</TableHead>
                <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap">Role</TableHead>
                <TableHead className="text-md font-semibold text-gray-900 whitespace-nowrap">Organization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.map((attendee, index) => (
                <TableRow 
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <TableCell>
                    <div className="flex items-center gap-1 w-[180px]">
                      <CellControl className="font-medium text-gray-900" value={attendee.first_name} />
                      <CellControl className="font-medium text-gray-900" value={attendee.last_name} />
                    </div>
                  </TableCell>

                  <TableCell>
                    <CellControl className="text-gray-900" value={attendee.email} />
                  </TableCell>

                  <TableCell>
                    <CellControl className="text-gray-900 w-[180px]" value={attendee.telegram} />
                  </TableCell>

                  <TableCell>
                    <div className="w-[180px]">
                    </div>
                    {/* <div>
                      <div className="text-gray-900">{attendee.check_in}</div>
                      <div className="text-sm text-gray-500">{attendee.check_out}</div>
                    </div> */}
                  </TableCell>

                  <TableCell>
                    <CellControl className="text-gray-900 w-[120px]" value={attendee.bring_kids ? "Yes" : "No"} />
                  </TableCell>

                  <TableCell>
                    <CellControl className="text-gray-900 w-[180px]" value={attendee.role} />
                  </TableCell>

                  <TableCell>
                    <CellControl className="text-gray-900 w-[180px]" value={attendee.organization} />
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default Page