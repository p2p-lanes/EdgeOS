import { AttendeeProps } from "@/types/Attendee";

export const sortAttendees = (attendees: AttendeeProps[]) => {
  return attendees.sort((a, b) => {
      if (a.category === 'main') return -1;
      if (b.category === 'main') return 1;
      if (a.category === 'spouse') return -1;
      if (b.category === 'spouse') return 1;
      return 0;
    });
}