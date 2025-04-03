import { useState } from 'react'
import { Member } from '../types'
import DetailItem from './DetailItem'

const MemberItem = ({ member }: { member: Member }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
        tabIndex={0}
        aria-label={`Toggle details for ${member.name}`}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-gray-500"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className="font-medium">{member.name}</span>
          {member.isPassHolder && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              pass holder
            </span>
          )}
        </div>
        <button 
          className="text-gray-400 hover:text-gray-600"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 bg-white">
          {/* Primera fila con 3 campos */}
          <div className="grid grid-cols-3 gap-6">
            <DetailItem label="GENDER" value={member.gender} />
            <DetailItem label="EMAIL" value={member.email} />
            <DetailItem label="TELEGRAM ID" value={member.telegramId} />
          </div>
          
          {/* Separador */}
          <div className="h-px w-full bg-gray-200 my-4"></div>
          
          {/* Segunda fila con 3 campos */}
          <div className="grid grid-cols-3 gap-6">
            <DetailItem label="ORGANIZATION" value={member.organization} />
            <DetailItem label="ROLE" value={member.role} />
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">PASSES</p>
              <div className="flex gap-1 mt-1">
                {member.passes.map((pass, idx) => (
                  <span 
                    key={idx}
                    className={`inline-block w-6 h-6 rounded-md ${getPassColorClass(pass.color)}`} 
                    title={pass.type}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
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