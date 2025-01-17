import { FormInputWrapper } from "../../../../../components/ui/form-input-wrapper";
import SectionWrapper from "./SectionWrapper";
import { MultiSelect } from "@/components/ui/MultiSelect";
import InputForm, { AddonInputForm } from "@/components/ui/Form/Input";
import SelectForm from "@/components/ui/Form/Select";
import CheckboxForm from "@/components/ui/Form/Checkbox";
import { Label } from "@/components/ui/label";
import { SectionProps } from "@/types/Section";
import { SectionSeparator } from "./section-separator";
import { useCityProvider } from "@/providers/cityProvider";
import { dynamicForm } from "@/constants";


const shareableInfo = [
  { value: "first_name", label: "First name" },
  { value: "last_name", label: "Last name" },
  { value: "email", label: "Email address" },
  { value: "participation", label: "Participation" },
  { value: "telegram", label: "Telegram username" },
  { value: "brings_kids", label: "Whether or not I'm bringing kids" },
  { value: 'role', label: 'Role' },
  { value: 'organization', label: 'Organization' }
]

const ageOptions = [
  { value: "18-24", label: "18-24" },
  { value: "25-34", label: "25-34" },
  { value: "35-44", label: "35-44" },
  { value: "45-54", label: "45-54" },
  { value: "55+", label: "55+" },
]

const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
  { value: "Prefer not to say", label: "Prefer not to say" },
]

const fieldsPersonalInformation = ["first_name", "last_name", "email", "gender", "age", "telegram", "residence", "eth_address", "referral", "local_resident", "info_not_shared"]

export function PersonalInformationForm({ formData, errors, handleChange, fields }: SectionProps) {
  const { getCity } = useCityProvider()
  const city = getCity()

  if (!fields || !fields.size || !fieldsPersonalInformation.some(field => fields.has(field))) return null;
  const form = dynamicForm[city?.slug ?? '']

  return (
    <>
    <SectionWrapper title="Personal Information" subtitle="Your basic information helps us identify and contact you.">
      <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
        {fields.has("first_name") && (
          <InputForm
            label="First name"
            id="first_name"
            value={formData.first_name}
            onChange={(value) => handleChange('first_name', value)}
            error={errors.first_name}
            isRequired={true}
          />
        )}
        {fields.has("last_name") && (
          <InputForm
            label="Last name"
            id="last_name"
            value={formData.last_name}
            onChange={(value) => handleChange('last_name', value)}
            error={errors.last_name}
            isRequired={true}
          />
        )}
        {fields.has("email") && (
          <InputForm
            label="Email"
            id="email"
            value={formData.email ?? ''}
            onChange={(value) => handleChange('email', value)}
            error={errors.email}
            isRequired={true}
          />
        )}
        {fields.has("gender") && (
          <SelectForm 
            label="Gender"
            id="gender"
            value={formData.gender}
            onChange={(value) => handleChange('gender', value)}
            error={errors.gender}
            isRequired={true}
            options={genderOptions}
          />
        )}
        {fields.has("age") && (
          <SelectForm 
            label="Age"
            id="age"
            value={formData.age}
            onChange={(value) => handleChange('age', value)}
            error={errors.age}
            isRequired={true}
            options={ageOptions}
          />
        )}
        {fields.has("telegram") && (
          <AddonInputForm
            label="Telegram username"
            id="telegram"
            value={formData.telegram}
            onChange={(value) => handleChange('telegram', value)}
            error={errors.telegram}
            isRequired={true}
            subtitle={`The primary form of communication during ${city?.name} will be a Telegram group, so create an account if you don't already have one`}
            addon="@"
              placeholder="username"
            />
        )}
        {fields.has("residence") && (
          <InputForm
            label="Usual location of residence"
            id="residence"
            value={formData.residence ?? ''}
            onChange={(value) => handleChange('residence', value)}
            error={errors.residence}
            placeholder={form?.personal_information?.residence_placeholder ?? "Healdsburg, California, USA"}
            subtitle="Please format it like [City, State/Region, Country]. Feel free to put multiple cities if you live in multiple places."
          />
        )}
        {fields.has("eth_address") && (
          <InputForm
            label="ETH address"
            id="eth_address"
            value={formData.eth_address ?? ''}
            onChange={(value) => handleChange('eth_address', value)}
            error={errors.eth_address}
            isRequired={false}
            placeholder="0x..."
            subtitle="For POAPs, NFTs, allowlists."
          />
        )}
        {fields.has("referral") && (
          <InputForm
            label="Did anyone refer you?"
            id="referral"
            value={formData.referral ?? ''}
            onChange={(value) => handleChange('referral', value)}
            error={errors.referral}
            isRequired={false}
            subtitle="List everyone who encouraged you to apply."
          />
        )}
      </div>

      {fields.has("local_resident") && (
        <div style={{ marginTop: '24px' }}>
          <CheckboxForm
            label={`Are you a ${dynamicForm[city?.slug ?? '']?.local} local?`}
            id="local_resident"
            checked={formData.local_resident || false}
            onCheckedChange={(checked: boolean) => handleChange('local_resident', checked === true)}
          />
        </div>
      )}

      {fields.has("info_not_shared") && (
        <FormInputWrapper>
          <Label>
            Info I&apos;m <strong>NOT</strong> willing to share with other attendees
            <p className="text-sm text-muted-foreground mb-2">
              We will make a directory to make it easier for attendees to coordinate
            </p>
          </Label>
          <div className="space-y-2 ">
            <MultiSelect options={shareableInfo} onChange={(selected) => handleChange('info_not_shared', selected)} defaultValue={formData.info_not_shared}/>
          </div>
        </FormInputWrapper>
      )}
      </SectionWrapper>
      <SectionSeparator />
    </>
  )
}

