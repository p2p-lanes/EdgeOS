import { useState } from 'react'
import DetailItem from './DetailItem'
import { ChevronDown, Pencil, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import useGetPassesData from '@/hooks/useGetPassesData'
import ParticipationTickets from '@/components/common/ParticipationTickets'
import MemberFormModal from './AddMemberModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { Member } from '@/types/Group'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MemberItemProps {
  member: Member
  onMemberUpdated?: () => void
}

const MemberItem = ({ member, onMemberUpdated }: MemberItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const { products: passes } = useGetPassesData()

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que se expanda/colapse al hacer clic en editar
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Evitar que se expanda/colapse al hacer clic en eliminar
    setIsDeleteModalOpen(true)
  }

  const handleModalClose = () => {
    setIsEditModalOpen(false)
  }

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false)
  }

  const handleUpdateSuccess = () => {
    handleModalClose()
    
    // Llamar a la función de actualización pasada desde el componente padre
    if (onMemberUpdated) {
      onMemberUpdated()
    }
  }

  const handleDeleteSuccess = () => {
    handleDeleteModalClose()
    
    // Llamar a la función de actualización pasada desde el componente padre
    if (onMemberUpdated) {
      onMemberUpdated()
    }
  }

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
        tabIndex={0}
        aria-label={`Toggle details for ${member.first_name} ${member.last_name}`}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <User size={20} />
          <span className="font-medium">{member.first_name} {member.last_name}</span>
          {member.products.length > 0 && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              pass holder
            </span>
          )}
        </div>
        <motion.button 
          className="text-gray-400 hover:text-gray-600 transition-all duration-300"
          aria-label={isExpanded ? "Collapse" : "Expand"}
          initial={false}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <ChevronDown size={16} />
        </motion.button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="bg-white"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-2 gap-4">
                {/* Columna izquierda con información personal */}
                <div className="space-y-4">
                  <DetailItem label="GENDER" value={member.gender || ''} />
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">mail</p>
                    <p className="text-sm font-medium mt-1">{member.email}</p>
                  </div>
                  
                  <DetailItem label="TELEGRAM" value={member.telegram || ''} />
                  
                </div>
                
                {/* Columna derecha con PASSES */}
                <div className="space-y-4">
                  <DetailItem label="ORGANIZATION" value={member.organization || ''} />
                  
                  <DetailItem label="ROLE" value={member.role || ''} />
                  <div>

                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">PASSES</p>
                  <ParticipationTickets participation={member.products} passes={passes}/>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant={'outline'}
                  aria-label="Edit member"
                  onClick={handleEditClick}
                >
                  <Pencil size={16} className="mr-2" /> Edit
                </Button>
                
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-block">
                        <Button 
                          variant={'outline'}
                          aria-label="Remove member"
                          className='text-red-500 border-red-500 hover:bg-red-500 hover:text-white'
                          onClick={handleDeleteClick}
                          disabled={member.products.length > 0}
                        >
                          <Trash2 size={16} className="mr-2" /> Remove
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {member.products.length > 0 && (
                      <TooltipContent side="top" className="bg-gray-800 text-white px-3 py-2 rounded shadow-lg z-50">
                        <p>This member already has a purchased ticket.</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal para editar miembro */}
      <MemberFormModal
        open={isEditModalOpen}
        onClose={handleModalClose}
        member={member}
        onSuccess={handleUpdateSuccess}
      />

      {/* Modal para confirmar eliminación */}
      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        member={member}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}

export default MemberItem 