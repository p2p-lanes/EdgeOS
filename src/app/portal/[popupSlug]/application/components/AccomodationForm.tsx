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
import { FileUploadInput } from "@/components/ui/file-upload-input";
import uploadFileToS3 from "@/helpers/upload";
import { useState } from "react";

const fieldsAccomodation = ["is_renter"]

const AccomodationForm = ({formData, errors, handleChange, fields}: SectionProps) => {
  const { getCity } = useCityProvider()
  const city = getCity()
  const [loading, setLoading] = useState(false)

  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  if (!fields || !fields.size || !fieldsAccomodation.some(field => fields.has(field))) return null;

  const form = dynamicForm[city?.slug ?? '']

  const onChangeInputFile = async (files: File[]) => {
    setLoading(true)
    try {
      if (files.length > 0) {
        const file = files[0]
        const url = await uploadFileToS3(file)
        console.log('url', url)
        handleChange('booking_confirmation', url)
      } else {
        handleChange('booking_confirmation', '')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  console.log('formData', formData.booking_confirmation)

  return (
    <>
      <SectionWrapper
        title={form?.accommodation?.title ?? 'Accomodation'} 
        subtitle={form?.accommodation?.subtitle ?? ''}
        data-testid="accommodation-section"
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
                data-testid="accommodation-is-renter-checkbox"
              />
              <LabelMuted htmlFor="is_renter">
                Have you booked your accomodation in Hotel Magdalena via <Link href={'https://book.bunkhousehotels.com/?adult=1&arrive=2025-03-02&chain=18474&child=0&currency=USD&depart=2025-03-07&group=EDGECITY&hotel=10094&level=hotel&locale=en-US&productcurrency=USD&rooms=1'} target="_blank" className="text-primary underline">our link</Link>?
              </LabelMuted>
            </div>
          )
        }

      {
        <AnimatePresence>
          {formData.is_renter && (
            <motion.div {...animationProps}>
              {fields.has('booking_confirmation') && (
                <FileUploadInput
                  label="Select file"
                  id="booking_confirmation"
                  value={formData.booking_confirmation ?? ''}
                  onFilesSelected={onChangeInputFile}
                  error={errors.booking_confirmation}
                  placeholder="Booking confirmation file URL"
                  isRequired={true}
                  loading={loading}
                  subtitle="Please submit your booking confirmation for Hotel Magdalena here. Make sure we can see your name and booking dates."
                  data-testid="accommodation-booking-confirmation-upload"
                 />
              )}
              </motion.div>
            )
          }
        </AnimatePresence>
      }
      </SectionWrapper>

      <SectionSeparator />
    </>
  )
}
export default AccomodationForm