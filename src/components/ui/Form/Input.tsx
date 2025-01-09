import { AddonInput } from "../addon-input"
import { FormInputWrapper } from "../form-input-wrapper"
import { Input } from "../input"
import { LabelMuted, LabelRequired } from "../label"

interface InputFormProps {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  error?: string
  isRequired?: boolean
  subtitle?: string
  placeholder?: string
}

const InputForm = ({ label, id, value, onChange, error, subtitle, placeholder, isRequired = false }: InputFormProps) => {
  return (
    <FormInputWrapper>
      <div className="flex flex-col gap-2">
        <LabelRequired htmlFor={id} isRequired={isRequired}>{label}</LabelRequired>
        {subtitle && <LabelMuted className="text-sm text-muted-foreground">{subtitle}</LabelMuted>}
      </div>
      <Input 
        id={id} 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        placeholder={placeholder}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </FormInputWrapper>
  )
}

export const AddonInputForm = ({ label, id, value, onChange, error, isRequired = false, subtitle, addon, placeholder }: InputFormProps & { addon?: string, placeholder?: string }) => {
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
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </FormInputWrapper>
  )
}

export default InputForm