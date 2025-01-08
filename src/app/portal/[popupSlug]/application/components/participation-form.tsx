import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label, LabelMuted } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { RequiredFieldIndicator } from "../../../../../components/ui/required-field-indicator"
import { FormInputWrapper } from "../../../../../components/ui/form-input-wrapper"
import SectionWrapper from "./SectionWrapper"
import { useCityProvider } from "@/providers/cityProvider"
import { cn } from "@/lib/utils"
import { validateVideoUrl } from "@/helpers/validate"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { SectionProps } from "@/types/Section"
import RadioGroupForm from "@/components/ui/Form/RadioGroup"
import CheckboxForm from "@/components/ui/Form/Checkbox"
import TextArea from "@/components/ui/Form/TextArea"
import CardVideo from "./CardVideo"

interface ParticipationFormProps {
  formData: any;
  errors: Record<string, string>;
  handleChange: (name: string, value: string | string[] | boolean) => void;
}
const successOptions = [
  { id: "Build open source software for public good", label: "Build open source software for public good" },
  { id: "Find a project to invest in", label: "Find a project to invest in" },
  { id: "Get healthier", label: "Get healthier" },
  { id: "Get hired", label: "Get hired" },
  { id: "Have fun + make friends", label: "Have fun + make friends" },
  { id: "Learn about frontier topics", label: "Learn about frontier topics" },
  { id: "Make progress on my startup", label: "Make progress on my startup" },
  { id: "Meet collaborators / new hires", label: "Meet collaborators / new hires" },
  { id: "Pilot / test a real world solution", label: "Pilot / test a real world solution" },
  { id: "Raise funding for my project", label: "Raise funding for my project" },
  { id: "Become a major contributor to Edge City", label: "Become a major contributor to Edge City" },
  { id: "Other", label: "Other" },
]

const topicTracks = [
  { id: "Human organization", label: "Human organization" },
  { id: "Artificial intelligence", label: "Artificial intelligence" },
  { id: "Real-world crypto", label: "Real-world crypto" },
  { id: "Health, longevity, & bio", label: "Health, longevity, & bio" },
  { id: "Hard tech", label: "Hard tech" },
]

export function ParticipationForm({ formData, errors, handleChange, fields }: SectionProps) {
  const [isBuilder, setIsBuilder] = useState(formData.builder_boolean || false)
  const isVideoValid = validateVideoUrl(formData.video_url)

  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0},
    transition: { duration: 0.2, ease: "easeIn" }
  };

  const durationOptions = [
    { value: "1 week", label: "1 week" },
    { value: "1 weekend", label: "1 weekend" },
    { value: "2 weeks", label: "2 weeks" },
    { value: "a few days", label: "A few days" },
    { value: "full length", label: "The full time (May 24 - June 21, 2025)" },
  ]

  if (!fields) return null;

  return (
    <SectionWrapper title="Your participation" subtitle="We understand that your plans may change. We are collecting the following information just to get a sense of capacity of each day/week.">
      {
        fields.has('duration') && (
          <RadioGroupForm
            label="Duration"
            subtitle="Please share how long you intend to come."
            value={formData.duration}
            onChange={(value) => handleChange('duration', value)}
            error={errors.duration}
            isRequired={!isVideoValid}
            options={durationOptions}
          />
        )
      }

      {
        fields.has("builder_boolean") && (
          <>
            <CheckboxForm
              label="Are you a builder/developer interested in creating open-source software at Edge Esmeralda?"
              id="builder_boolean"
              checked={isBuilder}
              onCheckedChange={(checked) => {
                setIsBuilder(checked === true)
                handleChange('builder_boolean', checked === true)
              }}
            />
            <AnimatePresence>
              {isBuilder && (
                <motion.div {...animationProps}>
                  <TextArea
                    label="Elaborate on your role as a builder/developer if you said yes."
                    id="builder_description"
                    value={formData.builder_description ?? ''}
                    error={errors.builder_description}
                    handleChange={(value) => handleChange('builder_description', value)}
                    isRequired={!isVideoValid}
                  />
                </motion.div>
              )}
            </AnimatePresence>
        </>  
      )}

      {
        fields.has("hackathon_interest") && (
          <CheckboxForm
            label="We will have a hackathon at Edge Esmeralda. Do you think you’ll want to take part?"
            id="hackathon_interest"
            checked={formData.hackathon_interest || false}
            onCheckedChange={(checked) => handleChange('hackathon_interest', checked === true)}
          />
        )
      }

      {
        fields.has("investor") && (
          <CheckboxForm
            label="Are you a venture capitalist / investor coming to source deals?"
            id="investor"
            checked={formData.investor || false}
            onCheckedChange={(checked) => handleChange('investor', checked === true)}
          />
        )
      }

      {
        fields.has("video_url") && (
          <CardVideo videoUrl={formData.video_url} setVideoUrl={(url) => handleChange('video_url', url)} />
        )
      }

      {
        fields.has("personal_goals") && (
          <TextArea
            label="What are your goals in attending Edge Esmeralda?"
            id="goals"
            value={formData.personal_goals ?? ''}
            error={errors.personal_goals}
            handleChange={(value) => handleChange('personal_goals', value)}
          />
        )
      }

      {
        fields.has("host_session") && (
          <TextArea
            label="What topic would you choose if you were to host a session for Edge Esmeralda?"
            subtitle="This is just to get a sense of the topics you're interested in."
            id="host_session"
            value={formData.host_session ?? ''}
            error={errors.host_session}
            handleChange={(value) => handleChange('host_session', value)}
          />
        )
      }
      
    </SectionWrapper>
  )
}

