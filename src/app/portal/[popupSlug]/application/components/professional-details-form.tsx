import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormInputWrapper } from "./form-input-wrapper";
import { RequiredFieldIndicator } from "./required-field-indicator";
import SectionWrapper from "./SectionWrapper";
import { validateVideoUrl } from "@/helpers/validate";

interface ProfessionalDetailsFormProps {
  formData: any;
  errors: Record<string, string>;
  handleChange: (name: string, value: string) => void;
}

export function ProfessionalDetailsForm({ formData, errors, handleChange }: ProfessionalDetailsFormProps) {
  const isVideoValid = validateVideoUrl(formData.video_url)

  return (
    <SectionWrapper>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Professional Details</h2>
        <p className="text-muted-foreground">
          Tell us about your professional background and current role.
        </p>
      </div>
      <FormInputWrapper>
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
          <FormInputWrapper>
            <div className="h-full flex flex-col">
              <Label htmlFor="organization">
                Organization you represent
                {
                  !isVideoValid && <RequiredFieldIndicator />
                }
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                If you&apos;re just exploring something independently, note that.
              </p>
              <Input 
                id="organization" 
                value={formData.organization ?? ''}
                onChange={(e) => handleChange('organization', e.target.value)}
                className={`mt-auto ${errors.organization ? 'border-red-500' : ''}`}
              />
              {errors.organization && <p className="text-red-500 text-sm mt-1">{errors.organization}</p>}
            </div>
          </FormInputWrapper>
          <FormInputWrapper>
            <div className="h-full flex flex-col">
              <Label htmlFor="role">Role in the organization</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Job title or a 1-sentence description.
              </p>
              <Input 
                id="role" 
                value={formData.role ?? ''}
                onChange={(e) => handleChange('role', e.target.value)}
                className="mt-auto"
              />
            </div>
          </FormInputWrapper>
        </div>
        <FormInputWrapper>
          <div className="h-full flex flex-col mt-6">
            <Label htmlFor="social_media">
              Your active social media accounts
              {
                !isVideoValid && <RequiredFieldIndicator />
              }
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              e.g. personal blog, Twitter, Instagram, LinkedIn, Farcaster, Substack. Please provide the full link[s].
            </p>
            <Input 
              id="social_media" 
              value={formData.social_media ?? ''}
              onChange={(e) => handleChange('social_media', e.target.value)}
              className={`mt-auto ${errors.social_media ? 'border-red-500' : ''}`}
            />
            {errors.social_media && <p className="text-red-500 text-sm mt-1">{errors.social_media}</p>}
          </div>
        </FormInputWrapper>
      </FormInputWrapper>
    </SectionWrapper>
  )
}

