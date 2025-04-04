import { ApplicationProps } from "@/types/Application"
import { AttendeeProps } from "@/types/Attendee"

// Tipo para representar un miembro
export type Member = ApplicationProps & {
  isPassHolder: boolean
} 