'use client'

import useGetData from "./hooks/useGetData"
import AttendeesTable from "./components/Table/AttendeesTable"

const Page = () => {
  const { attendees } = useGetData()

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto">
      <div className="flex-none">
        <h1 className="text-2xl font-semibold tracking-tight">Attendee Directory</h1>
        <p className="text-sm text-muted-foreground mt-4">
          Reach out to your friends to plan dates, find shared housing, or organize activities together. 
          <br />
          *This directory includes only the information of those who have voluntarily opted in to share their details.
        </p>
      </div>

      <AttendeesTable attendees={attendees} />
    </div>
  )
}

export default Page