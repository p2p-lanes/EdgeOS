import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RequiredFieldIndicator } from "@/app/form/components/required-field-indicator"
import { FormInputWrapper } from "@/app/form/components/form-input-wrapper"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

interface ScholarshipFormProps {
  formData: any;
  errors: Record<string, string>;
  handleChange: (name: string, value: string | string[]) => void;
}

const scholarshipTypes = [
  { id: "young-builder", label: "Young builder (< 21 years old)" },
  { id: "academic", label: "Academic/researcher" },
  { id: "volunteer", label: "Month-long volunteer" },
]

export function ScholarshipForm({ formData, errors, handleChange }: ScholarshipFormProps) {
  const [isInterested, setIsInterested] = useState(formData.isScholarshipInterested || false)

  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
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
              id="scholarship-interest" 
              checked={isInterested}
              onCheckedChange={(checked) => {
                setIsInterested(checked === true)
                handleChange('isScholarshipInterested', checked === true)
                if (checked === false) {
                  handleChange('scholarshipType', [])
                  handleChange('scholarshipReason', '')
                }
              }}
            />
            <Label htmlFor="scholarship-interest">
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
                            checked={(formData.scholarshipType as string[]).includes(type.id)}
                            onCheckedChange={(checked) => {
                              const currentTypes = formData.scholarshipType as string[]
                              if (checked) {
                                handleChange('scholarshipType', [...currentTypes, type.id])
                              } else {
                                handleChange('scholarshipType', currentTypes.filter(id => id !== type.id))
                              }
                            }}
                          />
                          {type.label}
                        </Label>
                      ))}
                    </div>
                    {errors.scholarshipType && <p className="text-red-500 text-sm">{errors.scholarshipType}</p>}
                  </FormInputWrapper>
                  <FormInputWrapper>
                    <Label htmlFor="scholarship-reason">
                      Elaborate on why you&apos;re applying for a scholarship
                      <RequiredFieldIndicator />
                    </Label>
                    <Textarea 
                      id="scholarship-reason" 
                      className={`min-h-[100px] ${errors.scholarshipReason ? 'border-red-500' : ''}`}
                      value={formData.scholarshipReason}
                      onChange={(e) => handleChange('scholarshipReason', e.target.value)}
                    />
                    {errors.scholarshipReason && <p className="text-red-500 text-sm">{errors.scholarshipReason}</p>}
                  </FormInputWrapper>
                </FormInputWrapper>
              </motion.div>
            )}
          </AnimatePresence>
        </FormInputWrapper>
      </FormInputWrapper>
    </div>
  )
}

