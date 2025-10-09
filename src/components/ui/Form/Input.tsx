import { AddonInput } from "../addon-input"
import { FormInputWrapper } from "../form-input-wrapper"
import { Input } from "../input"
import { LabelMuted, LabelRequired } from "../label"

interface InputFormProps {
  label: any
  id: string
  value?: string
  onChange: (value: string) => void
  error?: string
  isRequired?: boolean
  subtitle?: string
  placeholder?: string
  type?: string
  ref?: React.RefObject<HTMLInputElement>
  multiple?: boolean,
  accept?: string
  className?: string
  maxLength?: number
  disabled?: boolean
  'data-testid'?: string
}

const InputForm = ({ label, id, value, onChange, error, subtitle, isRequired = false, type = 'text', maxLength, 'data-testid': testId, ...rest }: InputFormProps) => {
  return (
    <FormInputWrapper>
      <div className="flex flex-col gap-2">
        <LabelRequired htmlFor={id} isRequired={isRequired} className="flex">{label}</LabelRequired>
        {subtitle && <LabelMuted className="text-sm text-muted-foreground">{subtitle}</LabelMuted>}
      </div>
      <Input
        type={type}
        id={id} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        data-testid={testId}
        {...rest}
        maxLength={maxLength}
      />
      {error && <p className="text-red-500 text-sm" data-testid={testId ? `field-error-${testId}` : undefined}>{error}</p>}
    </FormInputWrapper>
  )
}

export const AddonInputForm = ({ label, id, value, onChange, error, isRequired = false, subtitle, addon, placeholder, 'data-testid': testId }: InputFormProps & { addon?: string, placeholder?: string }) => {
  return (
    <FormInputWrapper>
      <div className="flex flex-col gap-2">
        <LabelRequired htmlFor={id} isRequired={isRequired}>{label}</LabelRequired>
        {subtitle && <LabelMuted className="text-sm text-muted-foreground">{subtitle}</LabelMuted>}
      </div>
      <AddonInput 
        id={id} 
        addon={addon} 
        placeholder={placeholder} 
        defaultValue={value} 
        onChange={(e) => onChange(e.target.value)} 
        className={error ? 'border-red-500' : ''} 
        data-testid={testId}
      />
      {error && <p className="text-red-500 text-sm" data-testid={testId ? `field-error-${testId}` : undefined}>{error}</p>}
    </FormInputWrapper>
  )
}

export default InputForm