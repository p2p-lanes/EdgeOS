import { TicketPatron, TicketWeek } from "@/components/Icons/Tickets"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toDateRange } from "@/helpers/dates"
import type { ProductsPass } from "@/types/Products"

const ParticipationTickets = ({
  participation,
  className,
  passes,
}: {
  participation: ProductsPass[] | string
  className?: string
  passes: ProductsPass[]
}) => {
  if (typeof participation === "string") return

  const isPatreon = participation.some(
    (product) => product.category === "patreon",
  )
  const hasMonthPass = participation.some(
    (product) =>
      product.category === "month" || product.category === "local month",
  )
  const products = passes.filter(
    (product) =>
      product.category === "week" && product.attendee_category === "main",
  )

  const weeks: (ProductsPass | null)[] = [null, null, null, null]

  const toDay = (date: string) => {
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return ""
    return parsed.toISOString().slice(0, 10)
  }

  products.forEach((product, index) => {
    if (
      hasMonthPass ||
      participation.find(
        (p) =>
          toDay(p.start_date ?? "") === toDay(product.start_date ?? "") &&
          toDay(p.end_date ?? "") === toDay(product.end_date ?? ""),
      )
    ) {
      weeks[index] = { ...product, purchased: true }
      return
    }
    weeks[index] = product
  })

  console.log("participation", hasMonthPass, participation)

  return (
    <div className="flex gap-2">
      {weeks.map((week, index) => (
        <Ticket key={index} week={week} isPatreon={isPatreon} />
      ))}
    </div>
  )
}

const Ticket = ({
  week,
  isPatreon,
}: {
  week: ProductsPass | null
  isPatreon: boolean
}) => {
  const label =
    week?.start_date && week?.end_date
      ? toDateRange(week?.start_date, week?.end_date)
      : "No date"

  return (
    <Tooltip>
      <TooltipTrigger>
        {isPatreon && !!week?.purchased ? (
          <TicketPatron />
        ) : (
          <TicketWeek week={!!week?.purchased} />
        )}
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export default ParticipationTickets
