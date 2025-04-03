interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  // Mostrar la paginación siempre, incluso con una sola página (para fines de demostración)
  
  return (
    <div className="flex justify-center items-center gap-2 mt-8 py-2">
      <button 
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 hover:bg-gray-100"
        aria-label="Previous page"
      >
        Previous
      </button>
      <span className="text-sm font-medium px-2">
        Page {currentPage}/{totalPages}
      </span>
      <button 
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 hover:bg-gray-100"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  )
}

export default Pagination 