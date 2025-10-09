import { Checkbox } from "../checkbox"
import { FormInputWrapper } from "../form-input-wrapper"
import { LabelMuted, LabelRequired } from "../label"

type CheckboxFormProps = {
  label?: string
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  defaultChecked?: boolean
  value?: string
  required?: boolean
  subtitle?: string
  title?: string
  error?: string
  'data-testid'?: string
}

const CheckboxForm = ({ label, id, checked, onCheckedChange, disabled, defaultChecked, value, required, subtitle, title, error, 'data-testid': testId }: CheckboxFormProps) => {
  return (
    <FormInputWrapper>
        {title && <LabelRequired isRequired={required}>
        {title}
      </LabelRequired>}
        {subtitle && <p className="text-sm text-muted-foreground">
          {subtitle}
        </p>}
      <div className="flex items-center space-x-2 my-2">
        <Checkbox
          id={id}
          checked={checked}
          value={value}
          onCheckedChange={(checked: boolean) => onCheckedChange(checked)}
          disabled={disabled}
          defaultChecked={defaultChecked}
          className="bg-white"
          required={required}
          data-testid={testId}
        />
        {label && <LabelMuted htmlFor={id} className="cursor-pointer">{label}</LabelMuted>}
      </div>
      {error && <p className="text-red-500 text-sm" data-testid={testId ? `field-error-${testId}` : undefined}>{error}</p>}
    </FormInputWrapper>
  )
}
export default CheckboxForm