import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label, LabelMuted } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { RequiredFieldIndicator } from "./required-field-indicator"
import { FormInputWrapper } from "./form-input-wrapper"
import SectionWrapper from "./SectionWrapper"
import { useCityProvider } from "@/providers/cityProvider"
import { cn } from "@/lib/utils"
import { validateVideoUrl } from "@/helpers/validate"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

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

export function ParticipationForm({ formData, errors, handleChange }: ParticipationFormProps) {
  const [isBuilder, setIsBuilder] = useState(formData.builder_boolean || false)
  const isVideoValid = validateVideoUrl(formData.video_url)

  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0},
    transition: { duration: 0.2, ease: "easeIn" }
  };

  return (
    <SectionWrapper>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Your participation</h2>
        <p className="text-muted-foreground">
          We understand that your plans may change. We are collecting the following information just to get a sense of capacity of each day/week.
        </p>
      </div>
      <div>
        <FormInputWrapper>
          <Label>
            Duration
            {
              !isVideoValid && <RequiredFieldIndicator />
            }
            <p className="text-sm text-muted-foreground">
              Please share how long you intend to come. You can change this later
            </p>
          </Label>
          <RadioGroup 
            value={formData.duration}
            onValueChange={(value) => handleChange('duration', value)}
            className={cn("grid sm:grid-cols-2 gap-2 mt-2", errors.duration ? 'border rounded-md border-red-500' : '')}
          >
            <Label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer [&:has(:checked)]:bg-muted">
              <RadioGroupItem value="1 week" id="1 week" />
              1 week
            </Label>
            <Label className={"flex items-center gap-2 p-2 border rounded-md cursor-pointer [&:has(:checked)]:bg-muted"}>
              <RadioGroupItem value="1 weekend" id="1 weekend" />
              1 weekend
            </Label>
            <Label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer [&:has(:checked)]:bg-muted">
              <RadioGroupItem value="2 weeks" id="2 weeks" />
              2 weeks
            </Label>
            <Label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer [&:has(:checked)]:bg-muted">
              <RadioGroupItem value="a few days" id="a few days" />
              A few days
            </Label>
            <Label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer [&:has(:checked)]:bg-muted">
              <RadioGroupItem value="full length" id="full length" />
              The full time (May 24 - June 21, 2025)
            </Label>
          </RadioGroup>
          {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
        </FormInputWrapper>

        <FormInputWrapper>
          <div className="grid gap-4 gap-y-6 sm:grid-cols-1 mt-6 mb-3 items-start">
            <div className={cn("flex-col items-center space-x-2")}>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="builder_boolean" 
                  checked={isBuilder}
                  onCheckedChange={(checked) => {
                    setIsBuilder(checked === true)
                    handleChange('builder_boolean', checked === true)
                    if (checked === false) {
                      handleChange('builder_description', '')
                    }
                  }}
                />
                <LabelMuted  htmlFor="builder_boolean">
                  Are you a builder/developer interested in creating open-source software at Edge Esmeralda?
                </LabelMuted>
              </div>
              <AnimatePresence>
                {isBuilder && (
                  <motion.div {...animationProps}>
                    <FormInputWrapper>
                      <Label htmlFor="builder_description">
                        Elaborate on your role as a builder/developer if you said yes.
                        {
                          !isVideoValid && <RequiredFieldIndicator />
                        }
                      </Label>
                      <Textarea 
                        id="builder_description" 
                        className={`min-h-[100px] mt-2 ${errors.builder_description ? 'border-red-500' : ''}`}
                        value={formData.builder_description ?? ''}
                        onChange={(e) => handleChange('builder_description', e.target.value)}
                      />
                      {errors.builder_description && <p className="text-red-500 text-sm">{errors.builder_description}</p>}
                    </FormInputWrapper>
                  </motion.div>
                )}
              </AnimatePresence>     
            </div>
          </div>
        </FormInputWrapper>       

        <FormInputWrapper>
          <div className="flex items-center space-x-2 my-4">
            <Checkbox 
              id="hackathon"
              checked={formData.hackathon_interest || false}
              onCheckedChange={(checked) => handleChange('hackathon_interest', checked === true)}
            />
            <LabelMuted htmlFor="hackathon" className="">We will have a hackathon at Edge Esmeralda. Do you think you’ll want to take part?</LabelMuted>
          </div>
        </FormInputWrapper>

        <div className="flex items-center space-x-2">
          <Checkbox id="investor" checked={formData.investor || false} onCheckedChange={(checked) => handleChange('investor', checked === true)}/>
          <LabelMuted htmlFor="investor">
            Are you a venture capitalist / investor coming to source deals?
          </LabelMuted>
        </div>

        <Card className="px-6 mt-6 bg-[#29301e]">
          <div className="grid gap-4 sm:grid-cols-1 my-6">
            <FormInputWrapper>
              <div className="flex flex-col h-full my-1 gap-2">
                <div>
                  <Badge className="bg-gray-500 text-white">Preferred Option</Badge>
                </div>
                <Tooltip>
                  <Label htmlFor="video_url" className="text-white"> Please record a 1-2 minute video sharing your quick response to the {' '}
                    <TooltipTrigger asChild>
                      <span className="font-bold underline ">following questions</span>
                    </TooltipTrigger>
                    {' '}
                    (you don’t have to fill them in below if you add the video)
                  </Label>
                  <TooltipContent className="bg-white shadow-md border border-gray-200">
                    <p className="text-sm text-muted-foreground mt-1">
                      - What are your goals for Edge Esmeralda and why do you want to join?
                    </p>
                    <p className="text-sm text-muted-foreground mb-1">
                      - What is something you could contribute? A workshop, a talk, an area of expertise. Get creative!
                    </p>
                  </TooltipContent>
                </Tooltip>
                  <p className="text-sm text-gray-300">
                      You can upload your video to Dropbox, Google Drive, Youtube, or anywhere where you can make the link public and viewable
                    </p>
                <Input
                  id="video_url" 
                  value={formData.video_url ?? ''}
                  onChange={(e) => handleChange('video_url', e.target.value)}
                  className="mt-auto text-white"
                  placeholder="Video URL"
                  />
              </div>
            </FormInputWrapper>
          </div>
        </Card>

        <FormInputWrapper>
          <div className="mt-8 mb-6">
            <Label htmlFor="goals">What are your goals in attending Edge Esmeralda?
              <p className="text-sm text-muted-foreground mb-2">
                You can elaborate on how you want to contribute to the collective experience as well.
              </p>
            </Label>
            <Textarea 
              id="goals"
              value={formData.personal_goals ?? ''}
              onChange={(e) => handleChange('personal_goals', e.target.value)}
            />
          </div>
        </FormInputWrapper>

        <div className="grid gap-4 sm:grid-cols-1">
          <FormInputWrapper>
            <Label htmlFor="host_session">What topic would you choose if you were to host a session for Edge Esmeralda?
              <p className="text-sm text-muted-foreground mb-2">
                This is just to get a sense of the topics you're interested in.
              </p>
            </Label>
            <Textarea 
              id="host_session"
              value={formData.host_session ?? ''}
              onChange={(e) => handleChange('host_session', e.target.value)}
            />
            {errors.host_session && <p className="text-red-500 text-sm">{errors.host_session}</p>}
          </FormInputWrapper>
        </div>
      </div>
    </SectionWrapper>
  )
}

