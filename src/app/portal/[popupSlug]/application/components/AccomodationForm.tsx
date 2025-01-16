import { SectionProps } from "@/types/Section"
import SectionWrapper from "./SectionWrapper"
import { SectionSeparator } from "./section-separator";
import CheckboxForm from "@/components/ui/Form/Checkbox";
import { dynamicForm } from "@/constants";
import { useCityProvider } from "@/providers/cityProvider";

const fieldsAccomodation = ["is_renter"]

const AccomodationForm = ({formData, errors, handleChange, fields}: SectionProps) => {
  const { getCity } = useCityProvider()
  const city = getCity()

  if (!fields || !fields.size || !fieldsAccomodation.some(field => fields.has(field))) return null;

  const form = dynamicForm[city?.slug ?? '']
  return (
    <>
      <SectionWrapper
        title={form?.accommodation?.title ?? 'Accomodation'} 
        subtitle={form?.accommodation?.subtitle ?? ''}
      >
        {
          fields.has('is_renter') && (
            <CheckboxForm
              label={`Have you booked accomodation in Hotel Magdalena?`}
              id="is_renter"
              checked={formData.is_renter || false}
              onCheckedChange={(checked: boolean) => {
                handleChange('is_renter', checked === true)
              }}
            />
          )
        }
      </SectionWrapper>

      <SectionSeparator />
    </>
  )
}
export default AccomodationForm