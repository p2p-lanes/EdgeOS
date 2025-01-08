import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label, LabelMuted } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { FormInputWrapper } from "../../../../../components/ui/form-input-wrapper"
import { RequiredFieldIndicator } from "../../../../../components/ui/required-field-indicator"
import SectionWrapper from "./SectionWrapper"
import { SectionProps } from "@/types/Section"
import CheckboxForm from "@/components/ui/Form/Checkbox"
import InputForm from "@/components/ui/Form/Input"


export function ChildrenPlusOnesForm({ formData, errors, handleChange, fields }: SectionProps) {
  const [hasSpouse, setHasSpouse] = useState(formData.brings_spouse || false);
  const [hasKids, setHasKids] = useState(formData.brings_kids || false);

  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  if (!fields) return null;

  return (
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
        
        <FormInputWrapper>
          <div className="flex items-center space-x-2">
            <Checkbox 
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
            <LabelMuted htmlFor="brings_kids">I’m considering bringing kids</LabelMuted>
          </div>
          <AnimatePresence>
            {hasKids && (
              <motion.div {...animationProps}>
                <FormInputWrapper>
                  <Label htmlFor="kids_info">
                    If so, what are their ages? And how long will they stay?
                    <RequiredFieldIndicator />
                    <p className="text-sm text-muted-foreground">
                      We will approve your kids if we approve you. Your kids do not need to fill out their own version of this form however.
                    </p>
                  </Label>
                  <Textarea 
                    id="kids_info" 
                    className={`min-h-[100px] ${errors.kids_info ? 'border-red-500' : ''}`}
                    value={formData.kids_info}
                    onChange={(e) => handleChange('kids_info', e.target.value)}
                  />
                  {errors.kids_info && <p className="text-red-500 text-sm">{errors.kids_info}</p>}
                </FormInputWrapper>
              </motion.div>
            )}
          </AnimatePresence>
        </FormInputWrapper>
      </div>
    </SectionWrapper>
  )
}

