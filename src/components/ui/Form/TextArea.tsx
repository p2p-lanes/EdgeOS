import { FormInputWrapper } from "../form-input-wrapper"
import { LabelMuted, LabelRequired } from "../label"
import { Textarea } from "../textarea"

type TextAreaProps = {
  label: string
  id: string
  value: string
  error: string
  handleChange: (value: string) => void
  isRequired?: boolean
  subtitle?: string
  placeholder?: string
  'data-testid'?: string
}

const TextAreaForm = ({ label, id, value, error, handleChange, isRequired, subtitle, placeholder, 'data-testid': testId }: TextAreaProps) => {
  return (
    <FormInputWrapper>
      <div className="flex flex-col gap-2">
        <LabelRequired htmlFor={id} isRequired={isRequired}>
          {label}
        </LabelRequired>
        {subtitle && <LabelMuted className="text-sm text-muted-foreground">{subtitle}</LabelMuted>}
      </div>
      <Textarea 
        id={id} 
        className={`min-h-[72px] mt-2 ${error ? 'border-red-500' : ''}`}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        data-testid={testId}
      />
      {error && <p className="text-red-500 text-sm" data-testid={testId ? `field-error-${testId}` : undefined}>{error}</p>}
    </FormInputWrapper>
  )
}
export default TextAreaForm