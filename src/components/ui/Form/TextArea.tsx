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
}

const TextArea = ({ label, id, value, error, handleChange, isRequired, subtitle }: TextAreaProps) => {
  return (
    <FormInputWrapper>
      <LabelRequired htmlFor={id} isRequired={isRequired}>
        {label}
      </LabelRequired>
      {subtitle && <LabelMuted htmlFor={id}>{subtitle}</LabelMuted>}
      <Textarea 
        id={id} 
        className={`min-h-[72px] mt-2 ${error ? 'border-red-500' : ''}`}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </FormInputWrapper>
  )
}
export default TextArea