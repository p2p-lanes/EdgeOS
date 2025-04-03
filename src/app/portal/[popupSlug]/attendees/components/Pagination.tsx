
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"

type PaginationControlsProps = {
  currentPage: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const PaginationControls = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange
}: PaginationControlsProps) => {
  const totalPages = Math.ceil(totalItems / pageSize)
  
  // Generar array de páginas a mostrar
  const getPageNumbers = () => {
    const pages = []
    // Siempre mostrar la primera página
    pages.push(1)
    
    // Calcular rango de páginas alrededor de la página actual
    const startPage = Math.max(2, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)
    
    // Ajustar para mostrar 3 páginas siempre que sea posible
    if (startPage > 2) pages.push(-1) // Ellipsis
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    if (endPage < totalPages - 1) pages.push(-2) // Ellipsis
    
    // Siempre mostrar la última página si hay más de una
    if (totalPages > 1) pages.push(totalPages)
    
    return pages
  }

  return (
    <div className="flex items-center justify-between mt-4">

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#" 
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault()
                if (currentPage > 1) onPageChange(currentPage - 1)
              }}
              aria-disabled={currentPage === 1}
              tabIndex={currentPage === 1 ? -1 : 0}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {getPageNumbers().map((pageNumber, i) => {
            if (pageNumber === -1 || pageNumber === -2) {
              return (
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              )
            }
            
            return (
              <PaginationItem key={`page-${pageNumber}`}>
                <PaginationLink 
                  href="#" 
                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    e.preventDefault()
                    onPageChange(pageNumber)
                  }}
                  isActive={pageNumber === currentPage}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            )
          })}
          
          <PaginationItem>
            <PaginationNext
              href="#" 
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault()
                if (currentPage < totalPages) onPageChange(currentPage + 1)
              }}
              aria-disabled={currentPage >= totalPages}
              tabIndex={currentPage >= totalPages ? -1 : 0}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default PaginationControls 