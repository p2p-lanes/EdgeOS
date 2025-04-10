import { ChevronLeftIcon } from "lucide-react"
import { ChevronRightIcon } from "lucide-react"
import { Button } from "../ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  // Mostrar la paginación siempre, incluso con una sola página (para fines de demostración)
  
  return (
    <div className="flex justify-center items-center gap-2 mt-8 py-2">
      <Button 
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        variant="outline"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </Button>
      <span className="text-sm font-medium px-2">
        Page {currentPage}/{totalPages}
      </span>
      <Button 
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        variant="outline"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default Pagination 