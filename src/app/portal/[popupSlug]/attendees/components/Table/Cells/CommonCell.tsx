import { TableCell } from "@/components/ui/table"
import CellControl from "../../CellControl"

const CommonCell = ({value, className}: {value: string, className?: string}) => {
  return (
    <TableCell className={className}>
      <CellControl className="text-gray-900" value={value}>
        {value}
      </CellControl>
    </TableCell>
  )
}
export default CommonCell