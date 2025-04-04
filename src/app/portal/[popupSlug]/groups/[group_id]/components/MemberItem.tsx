import { useState } from 'react'
import DetailItem from './DetailItem'
import { ChevronDown, Pencil, Trash2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Member } from '../types'

const MemberItem = ({ member }: { member: Member }) => {
  const [isExpanded, setIsExpanded] = useState(false)

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
          {member.attendees[0].products.length > 0 && (
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
                  
                  <DetailItem label="ORGANIZATION" value={member.organization || ''} />
                  
                  <DetailItem label="ROLE" value={member.role || ''} />
                </div>
                
                {/* Columna derecha con PASSES */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">PASSES</p>
                  {/* <div className="flex gap-2 mt-1">
                    {member.passes.map((pass, idx) => (
                      <span 
                        key={idx}
                        className={`inline-block w-8 h-8 rounded-md border border-gray-200 ${getPassColorClass(pass.color)}`} 
                        title={pass.type}
                      />
                    ))}
                  </div> */}
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button 
                  variant={'outline'}
                  aria-label="Edit member"
                >
                  <Pencil size={16} className="mr-2" /> Edit
                </Button>
                
                <Button 
                  variant={'outline'}
                  aria-label="Remove member"
                  className='text-red-600'
                >
                  <Trash2 size={16} className="mr-2" /> Remove
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Función para obtener la clase de color de TailwindCSS para los pases
const getPassColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
  }
  
  return colorMap[color] || 'bg-gray-500'
}

export default MemberItem 