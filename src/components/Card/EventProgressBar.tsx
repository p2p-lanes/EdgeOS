import * as React from "react"
import { useIsMobile } from "@/hooks/useIsMobile"

export type EventStatus = 'not_started' | 'draft' | 'in review' | 'accepted' | 'rejected'

interface EventProgressBarProps {
  status: EventStatus
}

const statusColor = (status: string) => {
  if(status === 'in review') return 'bg-blue-100 text-blue-800'
  if(status === 'accepted') return 'bg-green-100 text-green-800'
  return 'bg-gray-100 text-gray-800'
}

export function EventProgressBar({ status }: EventProgressBarProps) {
  const stages = ['not_started', 'draft', 'in review', status === 'not_started' || status === 'accepted' ? 'accepted' : status === 'rejected' ? 'rejected' : null].filter(Boolean)
    
  const currentStageIndex = stages.indexOf(status)
  const progress = (currentStageIndex / (stages.length - 1)) * 100
  const isMobile = useIsMobile()

  const stageLabels = {
    'not_started': '',
    'draft': 'Draft',
    'in review': 'Application submitted',
    'accepted': 'Application accepted',
    'rejected': status === 'rejected' ? 'Application rejected' : null,
  }

  const statusLabel = status === 'not_started' ? 'Not started' : stageLabels[status]

  if(isMobile) return (
    <span className={`ml-auto text-sm ${statusColor(status)} px-3 py-1 font-semibold rounded-full`}>
      {statusLabel}
    </span>
  )

  return (
    <div className="w-full max-w-3xl mx-auto space-y-2">
      <div className="relative">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-300 ease-in-out bg-green-500"
            style={{ width: `${progress}%` }}
          />
          {status === 'rejected' && (
            <div 
              className="h-full absolute top-0 bg-red-500 transition-all duration-300 ease-in-out"
              style={{ 
                width: `${96 / (stages.length - 1)}%`,
                left: `${(stages.length - 2) / (stages.length - 1) * 100}%`
              }}
            />
          )}
        </div>
        <div className="absolute top-0 left-0 w-full flex justify-between">
          {stages.map((stage, index) => (
            <div 
              key={stage} 
              className={`w-4 h-4 rounded-full -mt-1 border-2 border-white ${
                currentStageIndex > index 
                  ? 'bg-green-500'
                  : currentStageIndex === index && index !== 0
                    ? (status === 'rejected' && index === stages.length - 1) ? 'bg-red-500' : 'bg-green-500'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="relative w-full h-8">
        {stages.map((stage, index) => (
          <div 
            key={stage} 
            className="absolute text-xs text-muted-foreground text-center"
            style={{
              left: `${(index / (stages.length - 1)) * 100}%`,
              transform: 'translateX(-50%)',
              width: '80px'
            }}
          >
            <span className={status === stage ? 'font-bold' : ''}>
              {stageLabels[stage as keyof typeof stageLabels]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

