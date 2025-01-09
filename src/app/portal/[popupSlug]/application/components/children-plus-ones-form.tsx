import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import SectionWrapper from "./SectionWrapper"
import { SectionProps } from "@/types/Section"
import CheckboxForm from "@/components/ui/Form/Checkbox"
import InputForm from "@/components/ui/Form/Input"
import TextAreaForm from "@/components/ui/Form/TextArea"
import { SectionSeparator } from "./section-separator"

const fieldsChildrenPlusOnes = ["brings_spouse", "brings_kids"]

export function ChildrenPlusOnesForm({ formData, errors, handleChange, fields }: SectionProps) {
  const [hasSpouse, setHasSpouse] = useState(formData.brings_spouse || false);
  const [hasKids, setHasKids] = useState(formData.brings_kids || false);

  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  if (!fields || !fields.size || !fieldsChildrenPlusOnes.some(field => fields.has(field))) return null;

  return (
    <>
    <SectionWrapper title="Children and +1s">
      <div className="grid gap-4 sm:grid-cols-2">

        {
          fields.has('brings_spouse') && (
            <div>
              <CheckboxForm
                label="I am bringing a spouse/partner"
                id="brings_spouse"
                checked={hasSpouse}
                onCheckedChange={(checked) => {
                  setHasSpouse(checked === true);
                  handleChange('brings_spouse', checked === true);
                  if (checked === false) {
                    handleChange('spouse_info', '');
                    handleChange('spouse_email', '');
                  }
                }}
              />
              <AnimatePresence>
                {hasSpouse && (
                  <motion.div {...animationProps}>
                    <div className="flex flex-col gap-6 mt-6">
                      <InputForm
                        label="Name of spouse/partner + duration of their stay"
                        id="spouse_info"
                        value={formData.spouse_info}
                        onChange={(value) => handleChange('spouse_info', value)}
                        error={errors.spouse_info}
                        isRequired={true}
                        subtitle="We will approve your spouse/partner if we approve you. However please have them fill out this form as well so we have their information in our system."
                      />
                      <InputForm
                        label="Spouse/partner email"
                        id="spouse_email"
                        value={formData.spouse_email}
                        onChange={(value) => handleChange('spouse_email', value)}
                        error={errors.spouse_email}
                        isRequired={true}
                        subtitle="Please provide your spouse/partner&apos;s email so we can remind them to apply."
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        }
        
        {
          fields.has('brings_kids') && (
            <div>
              <CheckboxForm
                label="I’m considering bringing kids"
                id="brings_kids"
                checked={hasKids}
                onCheckedChange={(checked) => {
                  setHasKids(checked === true);
                  handleChange('brings_kids', checked === true);
                  if (checked === false) {
                    handleChange('kids_info', '');
                  }
                }}
              />
              <AnimatePresence>
                {hasKids && (
                  <motion.div {...animationProps}>
                    <TextAreaForm
                      label="If so, what are their ages? And how long will they stay?"
                      id="kids_info"
                      value={formData.kids_info}
                      handleChange={(value) => handleChange('kids_info', value)}
                      error={errors.kids_info}
                      isRequired={true}
                      subtitle="We will approve your kids if we approve you. Your kids do not need to fill out their own version of this form however."
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        }
      </div>
    </SectionWrapper>
    <SectionSeparator />
    </>
  )
}


