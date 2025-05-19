import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import SectionWrapper from "./SectionWrapper"
import { validateVideoUrl } from "@/helpers/validate"
import { SectionProps } from "@/types/Section"
import RadioGroupForm from "@/components/ui/Form/RadioGroup"
import CheckboxForm from "@/components/ui/Form/Checkbox"
import CardVideo from "./CardVideo"
import TextAreaForm from "@/components/ui/Form/TextArea"
import { SectionSeparator } from "./section-separator"
import { useCityProvider } from "@/providers/cityProvider"
import { dynamicForm } from "@/constants"
import { formatDate} from "@/helpers/dates"

const fieldsParticipation = ["duration", "builder_boolean", "builder_description", "hackathon_interest", "investor", "video_url", "personal_goals", "host_session"]

export function ParticipationForm({ formData, errors, handleChange, fields }: SectionProps) {
  const [isBuilder, setIsBuilder] = useState(formData.builder_boolean || false)
  const isVideoValid = validateVideoUrl(formData.video_url)
  const { getCity } = useCityProvider()
  const city = getCity()

  const form = dynamicForm[city?.slug ?? '']
  const dates = `${formatDate(city?.start_date, {day: 'numeric', month: 'short'})} - ${formatDate(city?.end_date, {day: 'numeric', month: 'short', year: 'numeric'})}`

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
    { value: "full length", label: `The full time (${dates})` },
  ]

  const durationBhutan = [
    { value: "full length", label: "I can attend Sept 14-21, 2025" },
    { value: "1 week", label: "8-day trip in Sept, but not during those dates." },
  ]

  if (!fields || !fields.size || !fieldsParticipation.some(field => fields.has(field))) return null;

  return (
    <>
      <SectionWrapper 
        title={form?.participation?.title ?? 'Your participation'} 
        subtitle={form?.participation?.subtitle ?? 'We understand that your plans may change. We are collecting the following information just to get a sense of capacity of each day/week.'}
      >

        
        {
          city?.slug === 'edge-bhutan-2025' && (
            <CheckboxForm
              title="Availability"
              label="I confirm my availability for Sept 14-21, 2025"
              subtitle="We can only accept participants who are able to join for the entire trip length from September 14-21. Please confirm your availability for these dates."
              id="duration"
              required={true}
              checked={formData.duration === 'full length' || false}
              onCheckedChange={(checked) => handleChange('duration', checked ? 'full length' : '')}
            />
          )
        }

        {/* {
          city?.slug === 'edge-bhutan-2025' && formData.duration === '1 week' && (
            <TextAreaForm
              label="Please share your preferred/alternative dates."
              id="preferred_dates"
              value={formData.preferred_dates ?? ''}
              error={errors.preferred_dates}
              handleChange={(value) => handleChange('preferred_dates', value)}
            />
          )
        } */}

        {
          city?.slug !== 'edge-bhutan-2025' && fields.has('duration') && (
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
                label={`Are you a builder/developer interested in creating open-source software at ${city?.name}?`}
                id="builder_boolean"
                checked={isBuilder}
                onCheckedChange={(checked) => {
                  setIsBuilder(checked === true)
                  handleChange('builder_boolean', checked === true)
                }}
              />
              <AnimatePresence>
                {isBuilder && fields.has("builder_description") && (
                  <motion.div {...animationProps}>
                    <TextAreaForm
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
              label={`We will have a hackathon at ${city?.name}. Do you think you’ll want to take part?`}
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
            <TextAreaForm
              label={`What are your goals in attending ${city?.name}?`}
              id="goals"
              value={formData.personal_goals ?? ''}
              error={errors.personal_goals}
              handleChange={(value) => handleChange('personal_goals', value)}
            />
          )
        }

        {
          fields.has("host_session") && (
            <TextAreaForm
              label={`What topic would you choose if you were to host a session for ${city?.name}?`}
              subtitle="This is just to get a sense of the topics you're interested in."
              id="host_session"
              value={formData.host_session ?? ''}
              error={errors.host_session}
              handleChange={(value) => handleChange('host_session', value)}
            />
          )
        }
      </SectionWrapper>

      <SectionSeparator />
    </>
  )
}

