'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import useGetGroup from '@/hooks/useGetGroup'
import Pagination from '@/components/common/Pagination'
import TeamHeader from './components/TeamHeader'
import SearchBar from './components/SearchBar'
import MembersList from './components/MembersList'
import { Loader } from '@/components/ui/Loader'

// Componente principal de la página de grupos
const GroupPage = () => {
  const { group_id } = useParams() as { group_id: string }
  const { group, loading, error } = useGetGroup(group_id)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const membersPerPage = 10

  // Filtrado de miembros basado en el término de búsqueda (nombre o email)
  const filteredMembers = group?.members 
    ? group.members.filter(member => {
        const term = searchTerm.toLowerCase().trim()
        if (!term) return true
        
        // Buscar en nombre completo, primer nombre, apellido y email
        return member.first_name?.toLowerCase().includes(term) || 
               member.last_name?.toLowerCase().includes(term) ||
               member.email?.toLowerCase().includes(term)
      })
    : []

  // Lógica de paginación
  const indexOfLastMember = currentPage * membersPerPage
  const indexOfFirstMember = indexOfLastMember - membersPerPage
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember)
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage)

  // Manejo del cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Reset a la primera página cuando cambia el término de búsqueda
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <Loader />
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="max-w-[820px] mx-auto py-8 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-gray-600">{error || 'No se pudo cargar el grupo'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-[820px] mx-auto space-y-6">
      <TeamHeader 
        totalMembers={group.members.length} 
        groupName={group.name}
      />
      
      <SearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
      />
      
      {filteredMembers.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-md border">
          <p className="text-gray-500">No se encontraron miembros con ese término de búsqueda.</p>
        </div>
      ) : (
        <>
          <MembersList members={currentMembers } />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  )
}

export default GroupPage