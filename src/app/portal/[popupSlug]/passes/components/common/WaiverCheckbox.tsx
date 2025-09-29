import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface WaiverCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

const WaiverCheckbox = ({ checked, onCheckedChange, className }: WaiverCheckboxProps) => {
  return (
    <div className={`w-full flex items-center space-x-2 ${className || ''}`}>
      <Checkbox
        id="waiver-agreement"
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-1"
      />
      <Label 
        htmlFor="waiver-agreement" 
        className="text-xs text-muted-foreground mt-1 cursor-pointer"
      >
        I have read and agree to the{" "}
        <a 
          href="https://waiver.smartwaiver.com/w/mp89nnv4h2ukzm3fhlkca/web/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-medium"
        >
          waiver and release of liability
        </a>
        {" "}for me and my family group.
      </Label>
    </div>
  )
}

export default WaiverCheckbox
