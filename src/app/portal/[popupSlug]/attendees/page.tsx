'use client'

import useGetData from "./hooks/useGetData"
import AttendeesTable from "./components/AttendeesTable"
import Permissions from "@/components/Permissions"

const Page = () => {
  const { 
    attendees, 
    loading, 
    totalAttendees, 
    currentPage, 
    pageSize, 
    handlePageChange, 
    handlePageSizeChange 
  } = useGetData()

  return (
    <Permissions>
      <div className="flex flex-col h-full max-w-7xl mx-auto p-6">
        <div className="flex-none">
          <h1 className="text-2xl font-semibold tracking-tight">Attendee Directory</h1>
          <p className="text-sm text-muted-foreground mt-4">
            Reach out to your friends to plan dates, find shared housing, or organize activities together. 
            <br />
            *This directory includes only the information of those who have voluntarily opted in to share their details.
          </p>
        </div>

        <AttendeesTable 
          attendees={attendees} 
          loading={loading}
          totalAttendees={totalAttendees}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </Permissions>
  )
}

export default Page