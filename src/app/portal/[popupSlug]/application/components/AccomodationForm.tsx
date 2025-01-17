import { SectionProps } from "@/types/Section"
import SectionWrapper from "./SectionWrapper"
import { SectionSeparator } from "./section-separator";
import CheckboxForm from "@/components/ui/Form/Checkbox";
import { dynamicForm } from "@/constants";
import { useCityProvider } from "@/providers/cityProvider";
import { LabelMuted } from "@/components/ui/label";
import Link from "next/link";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import InputForm from "@/components/ui/Form/Input";

const fieldsAccomodation = ["is_renter"]

const AccomodationForm = ({formData, errors, handleChange, fields}: SectionProps) => {
  const { getCity } = useCityProvider()
  const city = getCity()

  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

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
            <div className="flex items-center gap-2">
              <CheckboxForm
                id="is_renter"
                checked={formData.is_renter || false}
                onCheckedChange={(checked: boolean) => {
                handleChange('is_renter', checked === true)
              }}
              />
              <LabelMuted htmlFor="is_renter">
                Have you booked your accomodation in Hotel Magdalena via <Link href={'https://book.bunkhousehotels.com/?adult=1&arrive=2025-03-02&chain=18474&child=0&currency=USD&depart=2025-03-07&group=EDGECITY&hotel=10094&level=hotel&locale=en-US&productcurrency=USD&rooms=1'} target="_blank" className="text-primary underline">our link</Link>?
              </LabelMuted>
            </div>
          )
        }

        <AnimatePresence>
          {formData.is_renter && (
            <motion.div {...animationProps}>
              <InputForm
                  label="Booking confirmation"
                  id="booking_confirmation"
                  value={formData.booking_confirmation ?? ''}
                  onChange={(e) => handleChange('booking_confirmation', e)}
                  error={errors.booking_confirmation}
                  subtitle="Please upload your booking confirmation for Hotel Magdalena here. Make sure we can see your name and booking dates."
                />
            </motion.div>
          )}
        </AnimatePresence>
      </SectionWrapper>

      <SectionSeparator />
    </>
  )
}
export default AccomodationForm