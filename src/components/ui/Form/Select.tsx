import { FormInputWrapper } from "../form-input-wrapper"
import { LabelRequired } from "../label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select"

interface SelectFormProps {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  error?: string
  isRequired?: boolean
  placeholder?: string
  options: { value: string; label: string }[]
}

const SelectForm = ({ label, id, value, onChange, error, isRequired = false, placeholder, options }: SelectFormProps) => {
  return (
    <FormInputWrapper>
      <div className="my-2 space-y-1">
        <LabelRequired
          htmlFor={id}
          isRequired={isRequired}
        >
          {label}
        </LabelRequired>
        <Select onValueChange={(value) => onChange(value)} value={value}>
          <SelectTrigger id={id} className={error ? 'border-red-500' : ''}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </FormInputWrapper>
  )
}
export default SelectForm