import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label, LabelMuted } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { FormInputWrapper } from "./form-input-wrapper"
import { RequiredFieldIndicator } from "./required-field-indicator"
import SectionWrapper from "./SectionWrapper"
import { Input } from "@/components/ui/input"

interface ScholarshipFormProps {
  formData: any;
  errors: Record<string, string>;
  handleChange: (name: string, value: string | string[] | boolean) => void;
}

const scholarshipTypes = [
  { id: "Young builder (< 21 years old)", label: "Young builder (< 21 years old)" },
  { id: "Academic/researcher", label: "Academic/researcher" },
  // { id: "Month-long volunteer", label: "Month-long volunteer" },
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
          Fill out this section if you are interested in securing one of a limited number of scholarships for Edge Esmeralda.
          We are prioritizing scholars who apply for the full experience (May 24 - June 21, 2025).
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
            <LabelMuted htmlFor="scolarship_request">
              Are you interested in applying for a scholarship?
            </LabelMuted>
          </div>
          
          <AnimatePresence>
            {isInterested && (
              <motion.div {...animationProps}>
                <FormInputWrapper>
                  <FormInputWrapper>
                    <p className="text-sm text-muted-foreground">
                      We understand that some folks will need financial assistance to attend, 
                      and have other ways to contribute beyond financial support. 
                      We have limited numbers of discounted tickets to allocate. 
                      Please elaborate on why you’re applying, and what your contribution might be. 
                      We estimate roughly a 10 hour/week volunteer effort from folks who gets scholarships. 
                    </p>
                    <div className="space-y-2">
                      <Label>
                        [Preferred] Please share a ~60 second video answering the above. 
                        <p className="text-sm text-muted-foreground">
                          You can upload your video to Dropbox, Google Drive, Youtube, or anywhere where you can make the link public and viewable
                        </p>
                      </Label>
                      <Input 
                        id="scholarship_video_url" 
                        value={formData.scholarship_video_url}
                        onChange={(e) => handleChange('scholarship_video_url', e.target.value)}
                        className={errors.scholarship_video_url ? 'border-red-500' : ''}
                      />
                    </div>
                    {errors.scholarship_video_url && <p className="text-red-500 text-sm">{errors.scholarship_video_url}</p>}
                  </FormInputWrapper>
                  <FormInputWrapper>
                    <Label htmlFor="scholarship_details">
                      You can also write your answer, although video is preferred.
                    </Label>
                    <Textarea 
                      id="scholarship_details" 
                      className={`${errors.scolarship_details ? 'border-red-500' : ''}`}
                      value={formData.scolarship_details ?? ''}
                      onChange={(e) => handleChange('scolarship_details', e.target.value)}
                    />
                    {errors.scolarship_details && <p className="text-red-500 text-sm">{errors.scolarship_details}</p>}
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

