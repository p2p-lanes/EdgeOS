import { Checkbox } from "../checkbox"
import { FormInputWrapper } from "../form-input-wrapper"
import { LabelMuted } from "../label"

type CheckboxFormProps = {
  label?: string
  id: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

const CheckboxForm = ({ label, id, checked, onCheckedChange }: CheckboxFormProps) => {
  return (
    <FormInputWrapper>
      <div className="flex items-center space-x-2 my-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(checked: boolean) => onCheckedChange(checked)}
        />
        {label && <LabelMuted htmlFor={id}>{label}</LabelMuted>}
      </div>
    </FormInputWrapper>
  )
}
export default CheckboxForm