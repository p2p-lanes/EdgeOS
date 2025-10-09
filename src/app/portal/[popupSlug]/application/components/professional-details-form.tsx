import SectionWrapper from "./SectionWrapper";
import { validateVideoUrl } from "@/helpers/validate";
import InputForm from "@/components/ui/Form/Input";
import { SectionProps } from "@/types/Section";
import { SectionSeparator } from "./section-separator";
import { dynamicForm } from "@/constants";
import { useCityProvider } from "@/providers/cityProvider";

const fieldsProfessionalDetails = ["organization", "role", "social_media"]

export function ProfessionalDetailsForm({ formData, errors, handleChange, fields }: SectionProps) {
  const { getCity } = useCityProvider()
  const city = getCity()
  // const isVideoValid = validateVideoUrl(formData.video_url, fields)

  if (!fields || !fields.size || !fieldsProfessionalDetails.some(field => fields.has(field))) return null;

  const form = dynamicForm[city?.slug ?? '']

  return (
    <>
      <SectionWrapper title={form?.professional_details?.title ?? "Professional Details"} subtitle={form?.professional_details?.subtitle ?? "Tell us about your professional background and current role."} data-testid="professional-details-section">
        <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
        {fields.has("organization") && (
          <InputForm
            label="Organization you represent"
            id="organization"
            value={formData.organization ?? ''}
            onChange={(value: string) => handleChange('organization', value)}
            error={errors.organization}
            isRequired={true}
            subtitle="If you&apos;re just exploring something independently, note that."
            data-testid="professional-details-organization-input"
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
            data-testid="professional-details-role-input"
          />
        )}
      </div>

      {fields.has("social_media") && (
        <div className="w-full mt-4">
          <InputForm
            label="Your active social media accounts"
            id="social_media"
            value={formData.social_media ?? ''}
            onChange={(value: string) => handleChange('social_media', value)}
            error={errors.social_media}
            isRequired={false}
            subtitle="e.g. personal blog, Twitter, Instagram, LinkedIn, Farcaster, Substack. Please provide the full link[s]."
            data-testid="professional-details-social-media-input"
          />
        </div>
      )}

        {fields.has("github_profile") && (
          <InputForm
            label="Your GitHub profile"
            id="github_profile"
            value={formData.github_profile ?? ''}
            onChange={(value: string) => handleChange('github_profile', value)}
            error={errors.github_profile}
            subtitle="Show us what you are working on!"
            data-testid="professional-details-github-input"
          />
        )}

        {fields.has("area_of_expertise") && (
          <InputForm
            label="Areas of Expertise"
            id="area_of_expertise"
            value={formData.area_of_expertise ?? ''}
            onChange={(value: string) => handleChange('area_of_expertise', value)}
            error={errors.area_of_expertise}
            isRequired={false}
            subtitle=" Please list your top professional skills, areas of expertise, and/or spheres of influence (i.e. sustainable energy, AI R&D, neuropsychology and BMIs, cryptocurrency and blockchain development, etc)."
            data-testid="professional-details-expertise-input"
          />
        )}
      </SectionWrapper>
      <SectionSeparator />
    </>
  )
}

