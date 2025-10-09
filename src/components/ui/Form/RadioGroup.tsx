import { cn } from "@/lib/utils"
import { FormInputWrapper } from "../form-input-wrapper"
import { Label, LabelRequired } from "../label"
import { RadioGroup, RadioGroupItem } from "../radio-group"
import { RequiredFieldIndicator } from "../required-field-indicator"

interface RadioGroupFormProps {
  label: string
  subtitle: string
  value: string
  onChange: (value: string) => void
  error?: string
  isRequired?: boolean
  options: { value: string; label: string }[]
  'data-testid'?: string
}


const RadioGroupForm = ({ label, subtitle, value, onChange, error, isRequired = false, options, 'data-testid': testId }: RadioGroupFormProps) => {
  return (
    <FormInputWrapper>
      <LabelRequired isRequired={isRequired}>
        {label}
      </LabelRequired>
      <p className="text-sm text-muted-foreground">
        {subtitle}
      </p>
      <RadioGroup 
        value={value}
        onValueChange={(value) => onChange(value)}
        className={cn("grid sm:grid-cols-2 gap-2 mt-2", error ? 'border rounded-md border-red-500' : '')}
        data-testid={testId}
      >
        {options.map((option) => (
          <Label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer [&:has(:checked)]:bg-muted" key={option.value}>
            <RadioGroupItem value={option.value} id={option.value} />
            {option.label}
          </Label>
        ))}
      </RadioGroup>
      {error && <p className="text-red-500 text-sm" data-testid={testId ? `field-error-${testId}` : undefined}>{error}</p>}
    </FormInputWrapper>
  )
}
export default RadioGroupForm