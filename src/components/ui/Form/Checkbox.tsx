import { Checkbox } from "../checkbox"
import { FormInputWrapper } from "../form-input-wrapper"
import { LabelMuted } from "../label"

type CheckboxFormProps = {
  label?: string
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  defaultChecked?: boolean
  value?: string
}

const CheckboxForm = ({ label, id, checked, onCheckedChange, disabled, defaultChecked, value }: CheckboxFormProps) => {
  return (
    <FormInputWrapper>
      <div className="flex items-center space-x-2 my-2">
        <Checkbox
          id={id}
          checked={checked}
          value={value}
          onCheckedChange={(checked: boolean) => onCheckedChange(checked)}
          disabled={disabled}
          defaultChecked={defaultChecked}
        />
        {label && <LabelMuted htmlFor={id}>{label}</LabelMuted>}
      </div>
    </FormInputWrapper>
  )
}
export default CheckboxForm