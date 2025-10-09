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
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SectionSeparator } from "./section-separator";

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
    <>
    <SectionWrapper title={"Edge Patagonia 2025 residencies"} subtitle={"You can attend Edge City Patagonia solo, join an existing residency, or start your own."} data-testid="patagonia-residencies-section">
      <div className="grid gap-4 grid-cols-1 sm:items-end">
        {/* <CheckboxForm
          label={'Are you interested in being part of a residency?'}
          id="interested_in_residency"
          checked={formData.interested_in_residency || false}
          onCheckedChange={(checked: boolean) => handleChange('interested_in_residency', checked === true)}
        /> */}

        {/* <AnimatePresence>
            {formData.interested_in_residency && ( */}
              <div className="w-full flex flex-col gap-4">
                {/* <motion.div {...animationProps}>
                  <MultiSelectDropdown
                      title="Which type of residency are you interested in?"
                      defaultValue={formData.residencies_interested_in ?? []}
                      onChange={(value) => handleChange('residencies_interested_in', value)}
                      options={residencies}
                    />
                </motion.div> */}
                {/* <motion.div {...animationProps}> */}
                  <TextAreaForm
                    label="Please describe your current work or project, including the tech stack and tools you are using."
                    id="residencies_text"
                    value={formData.residencies_text ?? ''}
                    handleChange={(value) => handleChange('residencies_text', value)}
                    error={errors.residencies_text}
                    data-testid="patagonia-residencies-description-textarea"
                  />
                {/* </motion.div> */}

                <Label className="text-sm text-gray-500" data-testid="patagonia-residencies-find-link">
                  Find all residencies open for applications <Link href="https://edgecity.notion.site/Edge-City-Patagonia-Residency-Application-updated-regularly-240d45cdfc5980e980f8db7d362c553d" target="_blank" className="text-blue-500">here</Link>.
                </Label>
                <Label className="text-sm text-gray-500" data-testid="patagonia-residencies-submit-link">
                 Submit a proposal for your own residency <Link href="https://guildhall.simplefi.tech/dashboard/#/nc/form/8d445476-f4d6-4dc9-bb0d-7a8f234f6b33" target="_blank" className="text-blue-500">here</Link>.
                </Label>
              </div>
            {/* )}
          </AnimatePresence> */}
      </div>

    </SectionWrapper>
      <SectionSeparator />
    </>
  )
}
export default PatagoniaResidenciesForm