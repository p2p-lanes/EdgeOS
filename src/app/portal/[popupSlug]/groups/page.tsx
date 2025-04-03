'use client'

import { useState } from 'react'
import TeamHeader from './components/TeamHeader'
import SearchBar from './components/SearchBar'
import MembersList from './components/MembersList'
import { teamMembers } from './data/teamMembers'
import Pagination from '@/components/common/Pagination'

// Componente principal de la página de grupos
const GroupsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const membersPerPage = 10 // Reducido para mostrar paginación con menos datos

  // Filtrado de miembros basado en el término de búsqueda
  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Lógica de paginación
  const indexOfLastMember = currentPage * membersPerPage
  const indexOfFirstMember = indexOfLastMember - membersPerPage
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember)
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage)

  // Manejo del cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="max-w-[820px] mx-auto space-y-6">
      <TeamHeader />
      
      <SearchBar 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        totalMembers={teamMembers.length}
      />
      
      <MembersList members={currentMembers} />
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default GroupsPage
