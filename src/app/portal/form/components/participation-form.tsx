import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { RequiredFieldIndicator } from "./required-field-indicator"
import { FormInputWrapper } from "./form-input-wrapper"
import SectionWrapper from "./SectionWrapper"

interface ParticipationFormProps {
  formData: any;
  errors: Record<string, string>;
  handleChange: (name: string, value: string | string[] | boolean) => void;
}

const successOptions = [
  { id: "build-software", label: "Build open source software for public good" },
  { id: "find-project", label: "Find a project to invest in" },
  { id: "get-healthier", label: "Get healthier" },
  { id: "get-hired", label: "Get hired" },
  { id: "have-fun", label: "Have fun + make friends" },
  { id: "learn-topics", label: "Learn about frontier topics" },
  { id: "startup-progress", label: "Make progress on my startup" },
  { id: "meet-collaborators", label: "Meet collaborators / new hires" },
  { id: "pilot-solution", label: "Pilot / test a real world solution" },
  { id: "raise-funding", label: "Raise funding for my project" },
  { id: "major-contributor", label: "Become a major contributor to Edge City" },
  { id: "other", label: "Other" },
]

const topicTracks = [
  { id: "human-org", label: "Human organization" },
  { id: "ai", label: "Artificial intelligence" },
  { id: "crypto", label: "Real-world crypto" },
  { id: "health", label: "Health, longevity, & bio" },
  { id: "hard-tech", label: "Hard tech" },
]

const shareableInfo = [
  { id: "shareFirstName", label: "First name" },
  { id: "shareLastName", label: "Last name" },
  { id: "shareEmail", label: "Email address" },
  { id: "shareTelegram", label: "Telegram username" },
  { id: "shareCheckIn", label: "Check-in date" },
  { id: "shareCheckOut", label: "Check-out date" },
  { id: "shareKids", label: "Whether or not I'm bringing kids" },
]

export function ParticipationForm({ formData, errors, handleChange }: ParticipationFormProps) {
  const [isBuilder, setIsBuilder] = useState(formData.isBuilder || false)

  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  return (
    <SectionWrapper>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Your participation</h2>
        <p className="text-muted-foreground">
          We understand that your plans may change. We are collecting the following information just to get a sense of capacity of each day/week.
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>
            Learn more about our ticketing pricing and philosophy{" "}
            <Link href="#" className="text-primary hover:underline">
              here
            </Link>
            .
          </li>
          <li>
            Learn about ways you can contribute to the popup village{" "}
            <Link href="#" className="text-primary hover:underline">
              here
            </Link>
            .
          </li>
        </ul>
      </div>
      <FormInputWrapper>
        <FormInputWrapper>
          <Label>
            Duration
            <RequiredFieldIndicator />
          </Label>
          <RadioGroup 
            value={formData.duration}
            onValueChange={(value) => handleChange('duration', value)}
            className="grid gap-2 mt-2"
          >
            <Label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer [&:has(:checked)]:bg-muted">
              <RadioGroupItem value="weekend" id="weekend" />
              1 weekend
            </Label>
            <Label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer [&:has(:checked)]:bg-muted">
              <RadioGroupItem value="week" id="week" />
              1 week
            </Label>
            <Label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer [&:has(:checked)]:bg-muted">
              <RadioGroupItem value="2weeks" id="2weeks" />
              2 weeks
            </Label>
            <Label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer [&:has(:checked)]:bg-muted">
              <RadioGroupItem value="full" id="full" />
              The full time (June 2nd to June 30th, 2024)
            </Label>
            <Label className="flex items-center gap-2 p-2 border rounded-md cursor-pointer [&:has(:checked)]:bg-muted">
              <RadioGroupItem value="weekends" id="weekends" />
              All Weekends
            </Label>
          </RadioGroup>
          {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
        </FormInputWrapper>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInputWrapper>
            <Label htmlFor="check-in">
              Check-in
              <RequiredFieldIndicator />
            </Label>
            <Input 
              type="date" 
              id="check-in" 
              value={formData.checkIn}
              onChange={(e) => handleChange('checkIn', e.target.value)}
              className={errors.checkIn ? 'border-red-500' : ''}
            />
            {errors.checkIn && <p className="text-red-500 text-sm">{errors.checkIn}</p>}
          </FormInputWrapper>
          <FormInputWrapper>
            <Label htmlFor="check-out">
              Check-out
              <RequiredFieldIndicator />
            </Label>
            <Input 
              type="date" 
              id="check-out" 
              value={formData.checkOut}
              onChange={(e) => handleChange('checkOut', e.target.value)}
              className={errors.checkOut ? 'border-red-500' : ''}
            />
            {errors.checkOut && <p className="text-red-500 text-sm">{errors.checkOut}</p>}
          </FormInputWrapper>
        </div>

        <FormInputWrapper>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="builder-developer" 
                checked={isBuilder}
                onCheckedChange={(checked) => {
                  setIsBuilder(checked === true)
                  handleChange('isBuilder', checked === true)
                  if (checked === false) {
                    handleChange('builderRole', '')
                  }
                }}
              />
              <Label htmlFor="builder-developer">
                Would you consider yourself a builder/developer looking to build open source software while at Edge Esmeralda?
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="venture-capitalist" />
              <Label htmlFor="venture-capitalist">
                Are you a venture capitalist / investor coming to source deals?
              </Label>
            </div>
            <AnimatePresence>
              {isBuilder && (
                <motion.div {...animationProps}>
                  <FormInputWrapper>
                    <Label htmlFor="builder-role">
                      Elaborate on your role as a builder/developer if you said yes
                      <RequiredFieldIndicator />
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Certain builder/developers can qualify for a discounted &quot;Builder Pass&quot; if they meet certain requirements explained{" "}
                      <Link href="#" className="text-primary hover:underline">
                        here
                      </Link>
                      .
                    </p>
                    <Textarea 
                      id="builder-role" 
                      className={`min-h-[100px] mt-2 ${errors.builderRole ? 'border-red-500' : ''}`}
                      value={formData.builderRole}
                      onChange={(e) => handleChange('builderRole', e.target.value)}
                    />
                    {errors.builderRole && <p className="text-red-500 text-sm">{errors.builderRole}</p>}
                  </FormInputWrapper>
                </motion.div>
              )}
            </AnimatePresence>            
          </div>
        </FormInputWrapper>

        <FormInputWrapper>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hackathon"
                  checked={formData.participateHackathon || false}
                  onCheckedChange={(checked) => handleChange('participateHackathon', checked === true)}
                />
                <Label htmlFor="hackathon">Do you want to participate in the hackathon?</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="gitcoin"
                  checked={formData.gitcoinOSS || false}
                  onCheckedChange={(checked) => handleChange('gitcoinOSS', checked === true)}
                />
                <Label htmlFor="gitcoin">Are you applying as part of the Gitcoin OSS program?</Label>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="draftsAndDemos"
                checked={formData.participateDraftsAndDemos || false}
                onCheckedChange={(checked) => handleChange('participateDraftsAndDemos', checked === true)}
              />
              <Label htmlFor="draftsAndDemos">Do you want to participate in Drafts&Demos (weekend 2 hack)?</Label>
            </div>
          </div>
        </FormInputWrapper>

        <div className="grid gap-8 lg:grid-cols-2">
          <FormInputWrapper>
            <Label>
              What would success look like for you by the end of Edge Esmeralda?
              <RequiredFieldIndicator />
            </Label>
            <div className="space-y-2">
              {successOptions.map((option) => (
                <Label key={option.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={option.id}
                    checked={(formData.successLookLike as string[])?.includes(option.id)}
                    onCheckedChange={(checked) => {
                      const currentSuccess = formData.successLookLike as string[] || []
                      if (checked) {
                        handleChange('successLookLike', [...currentSuccess, option.id])
                      } else {
                        handleChange('successLookLike', currentSuccess.filter(id => id !== option.id))
                      }
                    }}
                  />
                  {option.label}
                </Label>
              ))}
            </div>
            {errors.successLookLike && <p className="text-red-500 text-sm">{errors.successLookLike}</p>}
          </FormInputWrapper>

          <FormInputWrapper>
            <Label htmlFor="goals">Elaborate on your goals in attending Edge Esmeralda</Label>
            <p className="text-sm text-muted-foreground mb-2">
              You can elaborate on how you want to contribute to the collective experience as well.
              See <Link href="#" className="text-primary hover:underline">here</Link> for ideas on ways to contribute.
            </p>
            <Textarea 
              id="goals"
              value={formData.goals}
              onChange={(e) => handleChange('goals', e.target.value)}
              className="min-h-[100px]"
            />
          </FormInputWrapper>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormInputWrapper>
            <Label htmlFor="hostSession">If you were to host a session on any topic for/with Edge Esmeraldans, what would that session be?</Label>
            <RequiredFieldIndicator />
            <p className="text-sm text-muted-foreground mb-2">
              This is just to get a sense of the topics you&apos;re interested in, not a commitment to host this particular session. You&apos;re welcome to change your plans as we get closer to June.
            </p>
            <Textarea 
              id="hostSession"
              value={formData.hostSession}
              onChange={(e) => handleChange('hostSession', e.target.value)}
              className="min-h-[100px]"
            />
          </FormInputWrapper>

          <FormInputWrapper>
              <Label>
                Top 1-3 topic tracks
                <RequiredFieldIndicator />
              </Label>
              <p className="text-sm text-muted-foreground">Select 1-3 tracks you are most excited to dive into intellectually while in Healdsburg.</p>
              <div className="space-y-2">
                {topicTracks.map((track) => (
                  <Label key={track.id} className="flex items-center gap-2">
                    <Checkbox 
                      id={track.id}
                      checked={(formData.topicTracks as string[]).includes(track.id)}
                      onCheckedChange={(checked) => {
                        const currentTracks = formData.topicTracks as string[]
                        if (checked) {
                          handleChange('topicTracks', [...currentTracks, track.id])
                        } else {
                          handleChange('topicTracks', currentTracks.filter(id => id !== track.id))
                        }
                      }}
                    />
                    {track.label}
                  </Label>
                ))}
              </div>
              {errors.topicTracks && <p className="text-red-500 text-sm">{errors.topicTracks}</p>}
          </FormInputWrapper>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <FormInputWrapper>
            <Label htmlFor="referral">Did anyone refer you?</Label>
            <p className="text-sm text-muted-foreground mb-2">
              List everyone who encouraged you to apply
            </p>
            <Textarea 
              id="referral"
              value={formData.referral}
              onChange={(e) => handleChange('referral', e.target.value)}
              className="min-h-[100px]"
            />
          </FormInputWrapper>

          <FormInputWrapper>
            <Label>
              Info I&apos;m willing to share with other attendees
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              We will make a directory to make it easier for attendees to coordinate
            </p>
            <div className="space-y-2">
              {shareableInfo.map((info) => (
                <Label key={info.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={info.id}
                    checked={formData[info.id] || false}
                    onCheckedChange={(checked) => {
                      handleChange(info.id, checked === true)
                    }}
                  />
                  {info.label}
                </Label>
              ))}
            </div>
          </FormInputWrapper>
        </div>


      </FormInputWrapper>
    </SectionWrapper>
  )
}

