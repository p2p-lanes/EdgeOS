import SectionWrapper from "./SectionWrapper";
import { validateVideoUrl } from "@/helpers/validate";
import InputForm from "@/components/ui/Form/Input";
import { SectionProps } from "@/types/Section";
import { SectionSeparator } from "./section-separator";

const fieldsProfessionalDetails = ["organization", "role", "social_media"]

export function ProfessionalDetailsForm({ formData, errors, handleChange, fields }: SectionProps) {
  const isVideoValid = validateVideoUrl(formData.video_url)

  if (!fields || !fields.size || !fieldsProfessionalDetails.some(field => fields.has(field))) return null;

  return (
    <>
      <SectionWrapper title="Professional Details" subtitle="Tell us about your professional background and current role.">
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
        {fields.has("organization") && (
          <InputForm
            label="Organization you represent"
            id="organization"
            value={formData.organization ?? ''}
            onChange={(value: string) => handleChange('organization', value)}
            error={errors.organization}
            isRequired={!isVideoValid}
            subtitle="If you&apos;re just exploring something independently, note that."
          />
        )}
        {fields.has("role") && (
          <InputForm
            label="Role in the organization"
            id="role"
            value={formData.role ?? ''}
            onChange={(value: string) => handleChange('role', value)}
            error={errors.role}
            isRequired={false}
            subtitle="Job title or a 1-sentence description."
          />
        )}
      </div>

      {fields.has("social_media") && (
        <InputForm
          label="Your active social media accounts"
          id="social_media"
          value={formData.social_media ?? ''}
          onChange={(value: string) => handleChange('social_media', value)}
          error={errors.social_media}
          isRequired={!isVideoValid}
          subtitle="e.g. personal blog, Twitter, Instagram, LinkedIn, Farcaster, Substack. Please provide the full link[s]."
        />
        )}
      </SectionWrapper>
      <SectionSeparator />
    </>
  )
}

