import type { AttendeePassState } from "@/types/Attendee"

export const sortAttendees = (attendees: AttendeePassState[]) => {
  return attendees.sort((a, b) => {
    if (a.category === "main") return -1
    if (b.category === "main") return 1
    if (a.category === "spouse") return -1
    if (b.category === "spouse") return 1
    if (a.category === "kid" && b.category === "kid") {
      return a.name.localeCompare(b.name)
    }
    return 0
  })
}
