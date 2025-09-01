'use client'

import useGetData from "./hooks/useGetData"
import AttendeesTable from "./components/AttendeesTable"
import Permissions from "@/components/Permissions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "../../../../components/ui/switch"
import { useEffect, useState } from "react"
import useExportCsv from "./hooks/useExportCsv"

const Page = () => {
  const { 
    attendees, 
    loading, 
    totalAttendees, 
    currentPage, 
    pageSize, 
    handlePageChange, 
    handlePageSizeChange,
    // filters
    searchQuery,
    setSearchQuery,
    bringsKids,
    setBringsKids,
    selectedWeeks,
    handleToggleWeek,
    applyFilters,
    clearFilters,
  } = useGetData()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { isExporting, handleExportCsv } = useExportCsv()

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      applyFilters()
    }
  }

  // Debounce search query: auto-apply after 300ms of inactivity
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 300)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  return (
    <Permissions>
      <div className="flex flex-col h-full max-w-5xl mx-auto p-6">
        <div className="flex-none">
          <h1 className="text-2xl font-semibold tracking-tight">Attendee Directory</h1>
          <p className="text-sm text-muted-foreground mt-4">
            Reach out to your friends to plan dates, find shared housing, or organize activities together. 
            <br />
            *This directory includes only the information of those who have voluntarily opted in to share their details.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Input
            aria-label="Search in directory"
            placeholder="Search by name, email, organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="bg-white"
          />
          {(searchQuery.trim() !== '' || bringsKids !== null || selectedWeeks.length > 0) && (
            <Button
              variant="ghost"
              aria-label="Clear filters"
              onClick={clearFilters}
              className="bg-red-500 text-white hover:bg-red-500 hover:shadow-md hover:text-white"
            >
              Clear filters
            </Button>
          )}
          <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
            <DialogTrigger asChild>
              <Button
                aria-label="Open filters"
                className="bg-white text-black hover:bg-white hover:shadow-md"
              >
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Filters</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Brings kids</span>
                    <span className="text-xs text-muted-foreground">Toggle to filter by bringing kids</span>
                  </div>
                  <Switch
                    checked={bringsKids ?? false}
                    onCheckedChange={(v: boolean) => setBringsKids(v)}
                    aria-label="Toggle brings kids filter"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">Weeks Coming</span>
                  <div className="flex flex-wrap gap-2">
                    {[1,2,3,4].map((week) => {
                      const isActive = selectedWeeks.includes(week)
                      return (
                        <Button
                          key={week}
                          variant={isActive ? 'default' : 'outline'}
                          className={isActive ? 'bg-primary text-white' : 'bg-white text-black'}
                          aria-pressed={isActive}
                          onClick={() => handleToggleWeek(week)}
                        >
                          Week {week}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-between gap-2">
                  <Button variant="ghost" onClick={() => { clearFilters(); setFiltersOpen(false) }}>
                    Clear
                  </Button>
                  <Button onClick={() => { applyFilters(); setFiltersOpen(false) }}>
                    Apply filters
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            aria-label="Export attendees as CSV"
            className="bg-white text-black hover:bg-white hover:shadow-md"
            onClick={handleExportCsv}
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
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