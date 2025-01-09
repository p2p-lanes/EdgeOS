'use client'

import { api } from "@/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Ticket } from "lucide-react"
import { useEffect } from "react"
import useGetData from "./hooks/useGetData"
import CellControl from "./components/CellControl"

interface Attendee {
  name: string
  email: string
  telegram: string
  participation: {
    weeks: string
    dates: string
  }
  bringingKids: boolean
}

const attendees: Attendee[] = [
  {
    name: "Jhon Doe",
    email: "jhondoe@gmail.com",
    telegram: "@jhondoe",
    participation: {
      weeks: "Week 1, 2, 3, 4",
      dates: "25/05 to 31/07"
    },
    bringingKids: true
  },
  {
    name: "Jane Doe",
    email: "janedoe@gmail.com",
    telegram: "@janedoe",
    participation: {
      weeks: "Week 1, 2, 3, 4",
      dates: "25/05 to 31/07"
    },
    bringingKids: false
  },
  {
    name: "Jackson Doe",
    email: "jacksondoe@gmail.com",
    telegram: "@jacksondoe",
    participation: {
      weeks: "Week 1, 2, 3, 4",
      dates: "25/05 to 31/07"
    },
    bringingKids: true
  },
  {
    name: "Damhne Doe",
    email: "damhnedoe@gmail.com",
    telegram: "@damhnedoe",
    participation: {
      weeks: "Week 1, 2, 3, 4",
      dates: "25/05 to 31/07"
    },
    bringingKids: false
  },
  {
    name: "Damian Doe",
    email: "damiandoe@gmail.com",
    telegram: "@damiandoe",
    participation: {
      weeks: "Week 1, 2, 3, 4",
      dates: "25/05 to 31/07"
    },
    bringingKids: false
  },
  {
    name: "Delilah Doe",
    email: "delilahdoe@gmail.com",
    telegram: "@delilahdoe",
    participation: {
      weeks: "Week 1, 2, 3, 4",
      dates: "25/05 to 31/07"
    },
    bringingKids: true
  },
  {
    name: "Duck Doe",
    email: "duckdoe@gmail.com",
    telegram: "@duckdoe",
    participation: {
      weeks: "Week 1, 2, 3, 4",
      dates: "25/05 to 31/07"
    },
    bringingKids: false
  },
  {
    name: "James Doe",
    email: "jamesdoe@gmail.com",
    telegram: "@jamesdoe",
    participation: {
      weeks: "Week 1, 2, 3, 4",
      dates: "25/05 to 31/07"
    },
    bringingKids: false
  }
]

const Page = () => {
  const { attendees } = useGetData()


  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Attendee Directory</h1>
        <p className="text-sm text-muted-foreground">
          Reach out to your friends to plan dates, find shared housing, or organize activities together. 
          <br />
          *This directory includes only the information of those who have voluntarily opted in to share their details.
        </p>
        
        <div className="overflow-x-auto">
          <div className="max-w-[920px]">
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
                      <div className="flex items-center gap-1">
                        <CellControl className="font-medium text-gray-900" value={attendee.first_name} />
                        <CellControl className="font-medium text-gray-900" value={attendee.last_name} />
                      </div>
                    </TableCell>
                    <TableCell><CellControl className="text-gray-900" value={attendee.email} /></TableCell>
                    <TableCell>{attendee.telegram}</TableCell>
                    <TableCell>
                      {/* <div>
                        <div className="text-gray-900">{attendee.check_in}</div>
                        <div className="text-sm text-gray-500">{attendee.check_out}</div>
                      </div> */}
                    </TableCell>
                    <TableCell>{attendee.bring_kids ? "Yes" : "No"}</TableCell>
                    <TableCell>{attendee.role}</TableCell>
                    <TableCell>{attendee.organization}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page