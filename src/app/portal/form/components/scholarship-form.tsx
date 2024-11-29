import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { FormInputWrapper } from "./form-input-wrapper"
import { RequiredFieldIndicator } from "./required-field-indicator"
import SectionWrapper from "./SectionWrapper"

interface ScholarshipFormProps {
  formData: any;
  errors: Record<string, string>;
  handleChange: (name: string, value: string | string[] | boolean) => void;
}

const scholarshipTypes = [
  { id: "Young builder (< 21 years old)", label: "Young builder (< 21 years old)" },
  { id: "Academic/researcher", label: "Academic/researcher" },
  { id: "Month-long volunteer", label: "Month-long volunteer" },
]

export function ScholarshipForm({ formData, errors, handleChange }: ScholarshipFormProps) {
  const [isInterested, setIsInterested] = useState(formData.scolarship_request || false)

  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  return (
    <SectionWrapper>  
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Edge Esmeralda scholarship</h2>
        <p className="text-sm text-muted-foreground">
          Fill out this section if you are interested in securing one of a limited number of scholarships for Edge Esmeralda. Learn more about our scholarship program{" "}
          <Link href="#" className="text-primary hover:underline">
            here
          </Link>
          . We are prioritizing scholars who apply for the full experience (June 2-30, 2024).
        </p>
      </div>
      <FormInputWrapper>
        <FormInputWrapper>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="scolarship_request" 
              checked={isInterested}
              onCheckedChange={(checked) => {
                setIsInterested(checked === true)
                handleChange('scolarship_request', checked === true)
                if (checked === false) {
                  handleChange('scholarship_categories', [])
                  handleChange('scholarship_details', '')
                }
              }}
            />
            <Label htmlFor="scolarship_request">
              Are you interested in applying for a scholarship?
            </Label>
          </div>
          
          <AnimatePresence>
            {isInterested && (
              <motion.div {...animationProps}>
                <FormInputWrapper>
                  <FormInputWrapper>
                    <Label>
                      Do any of these apply to you, as a scholarship applicant?
                      <RequiredFieldIndicator />
                    </Label>
                    <div className="space-y-2">
                      {scholarshipTypes.map((type) => (
                        <Label key={type.id} className="flex items-center gap-2">
                          <Checkbox 
                            id={type.id}
                            checked={(formData.scholarship_categories as string[])?.includes(type.id) ?? false}
                            onCheckedChange={(checked) => {
                              const currentTypes = formData.scholarship_categories as string[] ?? []
                              if (checked) {
                                handleChange('scolarship_categories', [...currentTypes, type.id])
                              } else {
                                handleChange('scolarship_categories', currentTypes.filter(id => id !== type.id))
                              }
                            }}
                          />
                          {type.label}
                        </Label>
                      ))}
                    </div>
                    {errors.scholarship_categories && <p className="text-red-500 text-sm">{errors.scholarship_categories}</p>}
                  </FormInputWrapper>
                  <FormInputWrapper>
                    <Label htmlFor="scholarship-reason">
                      Elaborate on why you&apos;re applying for a scholarship
                      <RequiredFieldIndicator />
                    </Label>
                    <Textarea 
                      id="scholarship-reason" 
                      className={`min-h-[100px] ${errors.scholarship_details ? 'border-red-500' : ''}`}
                      value={formData.scholarship_details ?? ''}
                      onChange={(e) => handleChange('scholarship_details', e.target.value)}
                    />
                    {errors.scholarship_details && <p className="text-red-500 text-sm">{errors.scholarship_details}</p>}
                  </FormInputWrapper>
                </FormInputWrapper>
              </motion.div>
            )}
          </AnimatePresence>
        </FormInputWrapper>
      </FormInputWrapper>
    </SectionWrapper>
  )
}

