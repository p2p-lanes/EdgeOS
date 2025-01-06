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
  const getAttendees = async () => {
    const response = await api.get('applications')
    console.log(response)
  }

  useEffect(() => {
    getAttendees()
  }, [])

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Attendee Directory</h1>
        <p className="text-sm text-muted-foreground">
          Reach out to your friends to plan dates, find shared housing, or organize activities together. 
          <br />
          *This directory includes only the information of those who have voluntarily opted in to share their details.
        </p>
        
        <div className="overflow-y-auto max-h-[calc(92vh-200px)]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="text-md font-semibold text-gray-900">Attendee</TableHead>
                <TableHead className="text-md font-semibold text-gray-900">Telegram Username</TableHead>
                <TableHead className="text-md font-semibold text-gray-900">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Participation
                  </div>
                </TableHead>
                <TableHead className="text-md font-semibold text-gray-900">I'm bringing kids</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.map((attendee, index) => (
                <TableRow 
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{attendee.name}</div>
                      <div className="text-sm text-gray-500">{attendee.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{attendee.telegram}</TableCell>
                  <TableCell>
                    <div>
                      <div className="text-gray-900">{attendee.participation.weeks}</div>
                      <div className="text-sm text-gray-500">{attendee.participation.dates}</div>
                    </div>
                  </TableCell>
                  <TableCell>{attendee.bringingKids ? "Yes" : "No"}</TableCell>
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