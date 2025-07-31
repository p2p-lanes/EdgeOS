import { useCityProvider } from "@/providers/cityProvider";
import { SectionProps } from "@/types/Section";
import { dynamicForm } from "@/constants";
import SectionWrapper from "./SectionWrapper";
import { useEffect, useState } from "react";
import { api } from "@/api";
import CheckboxForm from "@/components/ui/Form/Checkbox";
import { AnimatePresence, motion } from "framer-motion";
import MultiSelectDropdown from "@/components/ui/Form/MultiselectDropdown";
import TextAreaForm from "@/components/ui/Form/TextArea";

const fieldsPatagoniaResidencies = ["patagonia_residencies"]

const PatagoniaResidenciesForm = ({ formData, errors, handleChange, fields }: SectionProps) => {
  const [residencies, setResidencies] = useState<{ value: string; label: string }[]>([])
  const hasPatagoniaResidencies = !(!fields || !fields.size || !fieldsPatagoniaResidencies.some(field => fields?.has(field)))
  
  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };
  
  useEffect(() => {
    if(hasPatagoniaResidencies){
      api.get('applications/residencies').then((res) => {
        const formattedResidencies = res.data.map((residency: string) => ({
          value: residency,
          label: residency
        }))
        setResidencies(formattedResidencies)
      })
    }
  }, [hasPatagoniaResidencies])

  useEffect(() => {
    if(formData.residencies_interested_in && formData.residencies_interested_in.length > 0){
      handleChange('interested_in_residency', true)
    }
  }, [])

  if (!hasPatagoniaResidencies) return null;

  
  return (
    <SectionWrapper title={"Edge Patagonia 2025 residencies"} subtitle={"Please indicate any residencies you'd be interested in joining. As residencies are confirmed, we'll notify you when applications open. Resident organizers will also be able to see your name as someone who expressed interest."}>
      <div className="grid gap-4 grid-cols-1 sm:items-end">
        <CheckboxForm
          label={'Are you interested in being part of a residency?'}
          id="interested_in_residency"
          checked={formData.interested_in_residency || false}
          onCheckedChange={(checked: boolean) => handleChange('interested_in_residency', checked === true)}
        />

        <AnimatePresence>
            {formData.interested_in_residency && (
              <div className="w-full flex flex-col gap-4">
                {/* <motion.div {...animationProps}>
                  <MultiSelectDropdown
                      title="Which type of residency are you interested in?"
                      defaultValue={formData.residencies_interested_in ?? []}
                      onChange={(value) => handleChange('residencies_interested_in', value)}
                      options={residencies}
                    />
                </motion.div> */}
                <motion.div {...animationProps}>
                  <TextAreaForm
                    label="Please describe your current work or project, including the tech stack and tools you are using."
                    id="residencies_text"
                    value={formData.residencies_text ?? ''}
                    handleChange={(value) => handleChange('residencies_text', value)}
                    error={errors.residencies_text}
                  />
                </motion.div>


              </div>
            )}
          </AnimatePresence>
      </div>
    </SectionWrapper>
  )
}
export default PatagoniaResidenciesForm