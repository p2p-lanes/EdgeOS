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
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { ageOptions, shareableInfo } from "../constants/forms";
import { useEffect, useState } from 'react';
import { GENDER_OPTIONS } from "@/constants/util";

const fieldsPersonalInformation = ["first_name", "last_name", "email", "gender", "age", "telegram", "residence", "eth_address", "referral", "local_resident", "info_not_shared"]

export function PersonalInformationForm({ formData, errors, handleChange, fields }: SectionProps) {
  const { getCity } = useCityProvider()
  const city = getCity()
  const [genderSpecify, setGenderSpecify] = useState('')

  useEffect(() => {
    if (formData.gender && formData.gender !== '' && !GENDER_OPTIONS.some(opt => opt.value === formData.gender)) {
      handleChange('gender_specify', formData.gender);
      handleChange('gender', 'Specify');
    }
  }, [formData.gender]);

  const animationProps = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  if (!fields || !fields.size || !fieldsPersonalInformation.some(field => fields.has(field))) return null;
  const form = dynamicForm[city?.slug ?? '']

  return (
    <>
    <SectionWrapper title="Personal Information" subtitle="Your basic information helps us identify and contact you.">
      <div className="grid gap-4 sm:grid-cols-2">
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
        
        <div className="flex flex-col gap-4 w-full">
          {fields.has("gender") && (
            <SelectForm 
              label="Gender"
              id="gender"
              value={(formData.gender && formData.gender !== '' && !GENDER_OPTIONS.some(opt => opt.value === formData.gender)) ? 'Specify' : formData.gender}
              onChange={(value) => handleChange('gender', value)}
              error={errors.gender}
              isRequired={true}
              options={GENDER_OPTIONS}
            />
          )}

          <AnimatePresence>
            {formData.gender === 'Specify' && (
              <motion.div {...animationProps}>
                <InputForm
                  isRequired
                  label="Specify your gender"
                  id="gender_specify"
                  value={formData.gender_specify?.split(' - ')[1] ?? ''}
                  onChange={(e) => handleChange('gender_specify', `SYO - ${e}`)}
                  error={errors.gender_specify}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {fields.has("age") && (
          <div className="flex flex-col">
            <SelectForm 
              label="Age"
              id="age"
              value={formData.age}
              onChange={(value) => handleChange('age', value)}
              error={errors.age}
              isRequired={true}
              options={ageOptions}
            />
          </div>
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
      </div>

      {fields.has("local_resident") && (
        <div style={{ marginTop: '24px' }}>
          <SelectForm
            label="Are you a LATAM citizen / San Martin resident?"
            id="local_resident"
            value={formData.local_resident === null ? "" : formData.local_resident === true ? "yes" : "no"}
            onChange={(value) => handleChange("local_resident", value === "yes" ? true : false)}
            error={errors.local_resident}
            isRequired
            placeholder="Select..."
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
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

