"use client"

import type { PopupPublic } from "@edgeos/api-client"
import { CalendarDays, MapPin } from "lucide-react"
import { createContext, useContext } from "react"
import { ButtonAnimated } from "@/components/ui/button"
import { CardAnimation, CardContent } from "@/components/ui/card"
import { EventProgressBar, type EventStatus } from "./EventProgressBar"

const CTA_LABELS: Record<EventStatus, string> = {
  not_started: "Apply",
  draft: "Continue Application",
  "in review": "Edit Application",
  accepted: "Go to Passes",
  rejected: "",
  withdrawn: "Resume Application",
}

interface EventCardContext {
  popup: PopupPublic
  status: EventStatus
}

const EventCardCtx = createContext<EventCardContext | null>(null)

function useEventCard() {
  const ctx = useContext(EventCardCtx)
  if (!ctx) throw new Error("EventCard.* must be used within <EventCard>")
  return ctx
}

function formatDate(date: string | null | undefined): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString("en-EN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

interface RootProps {
  popup: PopupPublic
  status?: EventStatus
  children: React.ReactNode
}

function Root({ popup, status = "not_started", children }: RootProps) {
  return (
    <EventCardCtx.Provider value={{ popup, status }}>
      <CardAnimation
        anim="entry"
        duration={0.6}
        className="w-full overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row">{children}</div>
      </CardAnimation>
    </EventCardCtx.Provider>
  )
}

function Image() {
  const { popup } = useEventCard()
  return (
    <div className="relative sm:h-auto sm:hidden lg:inline-block lg:w-1/3">
      {popup.image_url ? (
        <img
          src={popup.image_url}
          alt={popup.name}
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300">
          <span className="text-4xl font-bold text-neutral-400">
            {popup.name?.charAt(0) ?? "?"}
          </span>
        </div>
      )}
    </div>
  )
}

function Content({ children }: { children: React.ReactNode }) {
  return (
    <CardContent className="flex flex-col w-full p-6 mr-10">
      {children}
    </CardContent>
  )
}

function Title() {
  const { popup } = useEventCard()
  return <h3 className="text-2xl font-bold mb-2">{popup.name}</h3>
}

function Tagline() {
  const { popup } = useEventCard()
  return <p className="text-sm text-muted-foreground mb-4">{popup.tagline}</p>
}

function Location() {
  const { popup } = useEventCard()
  return (
    <div className="flex items-center text-sm text-muted-foreground mb-2">
      <MapPin className="mr-2 h-4 w-4" />
      {popup.location}
    </div>
  )
}

function DateRange() {
  const { popup } = useEventCard()
  const start = formatDate(popup.start_date)
  const end = formatDate(popup.end_date)
  if (!start && !end) return null

  return (
    <div className="flex items-center text-sm text-muted-foreground mb-4">
      <CalendarDays className="mr-2 h-4 w-4" />
      {start} - {end}
    </div>
  )
}

function Progress() {
  const { status } = useEventCard()
  return (
    <div className="my-6">
      <EventProgressBar status={status} />
    </div>
  )
}

interface ApplyButtonProps {
  onClick: () => void
}

function ApplyButton({ onClick }: ApplyButtonProps) {
  const { status } = useEventCard()
  const label = CTA_LABELS[status]
  if (!label) return null

  return (
    <div className="flex items-end justify-end sm:justify-end">
      <ButtonAnimated onClick={onClick} className="w-full md:w-auto px-9">
        {label}
      </ButtonAnimated>
    </div>
  )
}

export const EventCard = Object.assign(Root, {
  Image,
  Content,
  Title,
  Tagline,
  Location,
  DateRange,
  Progress,
  ApplyButton,
})

export type { EventStatus } from "./EventProgressBar"
