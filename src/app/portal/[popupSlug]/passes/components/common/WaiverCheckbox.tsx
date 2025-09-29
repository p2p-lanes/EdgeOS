import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface WaiverCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

const WaiverCheckbox = ({ checked, onCheckedChange, className }: WaiverCheckboxProps) => {
  return (
    <TooltipProvider>
      <div className={`flex items-start space-x-2 ${className || ''}`}>
        <Checkbox
          id="waiver-agreement"
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="mt-1"
        />
        <div className="flex items-start space-x-2 flex-1">
          <Label 
            htmlFor="waiver-agreement" 
            className="text-xs text-muted-foreground mt-1 cursor-pointer"
          >
            I acknowledge the risks involved and{" "}
            <a 
              href="https://waiver.smartwaiver.com/w/mp89nnv4h2ukzm3fhlkca/web/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              agree to the Waiver and Release of Liability.
            </a>
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info 
                className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" 
                tabIndex={0}
                aria-label="Waiver information"
              />
            </TooltipTrigger>
            <TooltipContent 
              side="top" 
              className="max-w-xs p-3 text-xs leading-relaxed"
            >
              I understand that participating in this event involves inherent risks, including the possibility of injury or loss. By checking this box, I confirm that I have read and agree to the Waiver and Release of Liability, and I voluntarily accept these risks and release the organizers from any claims related to my participation.
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}

export default WaiverCheckbox
