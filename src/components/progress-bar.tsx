import * as React from "react"
import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  progress: number
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t">
      <Progress 
        value={progress} 
        className="w-full h-2 rounded-none" 
        aria-label="Form completion progress"
      />
    </div>
  )
}

