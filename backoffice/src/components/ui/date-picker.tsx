"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  id?: string
  defaultMonth?: Date
}

/**
 * Date picker using shadcn Calendar.
 * Stores dates as YYYY-MM-DD format (for UTC midnight conversion).
 */
export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date",
  className,
  id,
  defaultMonth,
}: DatePickerProps) {
  // Parse YYYY-MM-DD or ISO string to Date object
  const parseDate = (val: string): Date | undefined => {
    if (!val) return undefined
    // Extract just the date part and create date at noon to avoid timezone issues
    const datePart = val.slice(0, 10)
    const [year, month, day] = datePart.split("-").map(Number)
    return new Date(year, month - 1, day, 12, 0, 0)
  }

  // Format Date to YYYY-MM-DD string
  const formatDate = (date: Date | undefined): string => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const date = parseDate(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          key={defaultMonth?.getTime()}
          mode="single"
          selected={date}
          defaultMonth={date ?? defaultMonth}
          onSelect={(newDate) => onChange(formatDate(newDate))}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
