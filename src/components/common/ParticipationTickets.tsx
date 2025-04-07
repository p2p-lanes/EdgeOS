import { ProductsPass, ProductsProps } from "@/types/Products"
import CellControl from "../../app/portal/[popupSlug]/attendees/components/Table/Cells/CellControl";
import { TableCell } from "@/components/ui/table";
import { TicketWeek } from "@/components/Icons/Tickets";
import { TicketPatron } from "@/components/Icons/Tickets";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toDateRange } from "@/helpers/dates";

const ParticipationTickets = ({participation, className, passes}: {participation: ProductsProps[] | string, className?: string, passes: ProductsProps[]}) => {
  if(typeof participation === 'string') return;

  const isPatreon = participation.some(product => product.category === 'patreon')
  const hasMonthPass = participation.some(product => product.category === 'month')
  const products = passes.filter(product => product.category === 'week' && product.attendee_category === 'main')

  const weeks: (ProductsPass | null)[] = [null, null, null, null];

  products.forEach((product, index) => {
    if(hasMonthPass || participation.find(p => p.name.toLowerCase() === product.name.toLowerCase())) {
      weeks[index] = {...product, purchased: true}
      return;
    }
    weeks[index] = product
  });

  return (
    <div className="flex gap-2">
      {
        weeks.map((week, index) => <Ticket key={index} week={week} isPatreon={isPatreon}/>)
      }
    </div>
  )
}


const Ticket = ({ week, isPatreon}: {week: ProductsPass | null, isPatreon: boolean}) => {
  const label = week?.start_date && week?.end_date ? toDateRange(week?.start_date, week?.end_date) : 'No date'

  return (
    <Tooltip>
      <TooltipTrigger>
        {
          (isPatreon && !!week?.purchased) ? <TicketPatron /> : <TicketWeek week={!!week?.purchased} />
        }
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export default ParticipationTickets