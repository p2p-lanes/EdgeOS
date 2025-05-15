"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, CheckCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import Success from "./success"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import axios from "axios"
import { Checkbox } from "@/components/ui/checkbox"

const api_key_prod = "62f8e186b8946b524ebdb53215b4a6dbcd5e4b14203edab8383cd533156d8af8"
const api_key_dev = "e37e643784490aea0ac732101f38d8431f2420e0d8690faed1aa2df8bffe65e5"

export function CheckInForm() {
  const [arrivalDate, setArrivalDate] = useState<Date | undefined>()
  const [departureDate, setDepartureDate] = useState<Date | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [waiverSigned, setWaiverSigned] = useState(false)
  const [arrivalPopoverOpen, setArrivalPopoverOpen] = useState(false)
  const [departurePopoverOpen, setDeparturePopoverOpen] = useState(false)
  const params = useSearchParams()

  const email = params.get("email")
  const code = params.get("code")
  const application_id = params.get("application_id")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!arrivalDate || !departureDate || !email || !code || !application_id) return

    setIsSubmitting(true)

    const body = {
      code,
      application_id: parseInt(application_id),
      arrival_date: arrivalDate,
      departure_date: departureDate,
    }

    const response = await axios.post("https://portaldev.simplefi.tech/check-in/virtual", body, {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_DEVELOP === "true" ? api_key_dev : api_key_prod,
      },
    })

    if (response.status !== 200) {
      setIsSubmitting(false)
      setIsSuccess(false)
      toast.error("Error submitting check-in, please try again.")
      return
    }

    setIsSubmitting(false)
    setIsSuccess(true)
  }

  if (!email || !code || !application_id) {
    return <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
      <h1 className="text-2xl font-bold mb-2">Invalid URL</h1>
      <p className="text-gray-600 mb-6">
        Please use the correct URL to check in.
      </p>
    </div>
  }

  if (isSuccess && arrivalDate && departureDate && email) {
    return <Success arrivalDate={arrivalDate} departureDate={departureDate} />
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 md:p-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold mb-2">Online Check-in for Edge Esmeralda 2025</h1>
        <p className="text-gray-600 mb-6">
          We are excited to welcome you in Healdsburg and share this special time ahead. Please
          <strong> enter your (estimated) arrival and departure dates</strong> to help us create an amazing
          experience. 
          <br />
          Before submitting the form, please sign this <a href="https://waiver.smartwaiver.com/w/bgnpvra597aqdukktfwyss/web/" target="_blank" rel="noopener noreferrer" className="text-blue-500">waiver</a>.
          <br />
          <br />
          Note: <strong>Wristband pick-up is mandatory.</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Email Field - Readonly */}
            <div className="mb-6">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" disabled value={email || undefined} readOnly className="mt-1 bg-gray-50" />
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="flex mb-2">
                  Arrival Date <span className="text-red-500 ml-1">*</span>
                </Label>
                <Popover open={arrivalPopoverOpen} onOpenChange={setArrivalPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !arrivalDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {arrivalDate ? format(arrivalDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={arrivalDate}
                      onSelect={(date) => {
                        setArrivalDate(date)
                        setArrivalPopoverOpen(false)
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="flex mb-2">
                  Departure Date <span className="text-red-500 ml-1">*</span>
                </Label>
                <Popover open={departurePopoverOpen} onOpenChange={setDeparturePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={!arrivalDate}
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !departureDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {departureDate ? format(departureDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={departureDate}
                      onSelect={(date) => {
                        setDepartureDate(date)
                        setDeparturePopoverOpen(false)
                      }}
                      disabled={(date) => (!arrivalDate || date < arrivalDate)}
                    />
                  </PopoverContent>
                </Popover>
              </div>

               {/* Waiver Field */}
            </div>
            <div className="my-2 flex items-center gap-2 ">
              <Checkbox id="waiver" required checked={waiverSigned} onCheckedChange={(checked) => setWaiverSigned(checked === true)} />
              <Label htmlFor="waiver" className="cursor-pointer"> I confirm I have understood and signed the <a href="https://waiver.smartwaiver.com/w/bgnpvra597aqdukktfwyss/web/" target="_blank" rel="noopener noreferrer" className="text-blue-500">waiver</a>.<span className="text-red-500 ml-1">*</span></Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white py-3"
              disabled={isSubmitting || !arrivalDate || !departureDate || !waiverSigned}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  )
}
