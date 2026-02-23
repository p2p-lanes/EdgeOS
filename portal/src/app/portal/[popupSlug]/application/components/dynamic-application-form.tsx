"use client"

import type { ApplicationPublic, PopupPublic } from "@edgeos/api-client"
import { ApplicationsService } from "@edgeos/api-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { ButtonAnimated } from "@/components/ui/button"
import InputForm, { AddonInputForm } from "@/components/ui/Form/Input"
import SelectForm from "@/components/ui/Form/Select"
import { FormInputWrapper } from "@/components/ui/form-input-wrapper"
import { Label } from "@/components/ui/label"
import { MultiSelect } from "@/components/ui/MultiSelect"
import { GENDER_OPTIONS } from "@/constants/util"
import { splitForCreate, splitForUpdate } from "@/lib/form-data-splitter"
import { queryKeys } from "@/lib/query-keys"
import { useApplication } from "@/providers/applicationProvider"
import type {
  ApplicationFormSchema,
  FormFieldSchema,
} from "@/types/form-schema"
import { ageOptions, shareableInfo } from "../constants/forms"
import { useApplicationForm } from "../hooks/use-application-form"
import { CompanionsSection, type CompanionWithId } from "./companions-section"
import { FormSection } from "./form-section"
import { ProgressBar } from "./progress-bar"
import SectionWrapper from "./SectionWrapper"
import { SectionSeparator } from "./section-separator"

const animationProps = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: { duration: 0.3, ease: "easeInOut" },
}

interface DynamicApplicationFormProps {
  schema: ApplicationFormSchema
  existingApplication?: ApplicationPublic | null
  popup: PopupPublic
}

export function DynamicApplicationForm({
  schema,
  existingApplication,
  popup,
}: DynamicApplicationFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { getRelevantApplication, updateApplication } = useApplication()
  const application = getRelevantApplication()

  const {
    values,
    errors,
    handleChange,
    validate,
    populateFromApplication,
    progress,
  } = useApplicationForm(schema)

  const [companions, setCompanions] = useState<CompanionWithId[]>([])
  const [statusBtn, setStatusBtn] = useState({
    loadingDraft: false,
    loadingSubmit: false,
  })

  // Populate form if editing existing application
  useEffect(() => {
    if (existingApplication) {
      populateFromApplication(existingApplication)

      // Populate companions from attendees
      if (existingApplication.attendees) {
        const existingCompanions: CompanionWithId[] =
          existingApplication.attendees
            .filter((a) => a.category === "spouse" || a.category === "kid")
            .map((a) => ({
              _id: a.id,
              name: a.name,
              category: a.category,
              email: a.email ?? undefined,
              gender: a.gender ?? undefined,
            }))
        setCompanions(existingCompanions)
      }
    }
  }, [existingApplication, populateFromApplication])

  const submitMutation = useMutation({
    mutationFn: async (status: "draft" | "in review") => {
      const companionPayload = companions.map(({ _id, ...rest }) => rest)

      if (application?.id) {
        return ApplicationsService.updateMyApplication({
          popupId: popup.id,
          requestBody: splitForUpdate({ values, status }),
        })
      }

      return ApplicationsService.createMyApplication({
        requestBody: splitForCreate({
          values,
          popupId: popup.id,
          companions: companionPayload,
          status,
        }),
      })
    },
    onSuccess: (result) => {
      updateApplication(result)
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.mine() })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatusBtn({ loadingDraft: false, loadingSubmit: true })

    const { isValid, errors: validationErrors } = validate(false)
    if (!isValid) {
      const fields = Object.keys(validationErrors).join(", ")
      toast.error("Error", {
        description: `Please fill in the following required fields: ${fields}`,
      })
      setStatusBtn({ loadingDraft: false, loadingSubmit: false })
      return
    }

    try {
      await submitMutation.mutateAsync("in review")
      toast.success("Application Submitted", {
        description: "Your application has been successfully submitted.",
      })
      router.push(`/portal/${popup.slug}`)
    } catch {
      toast.error("Error Submitting Application", {
        description:
          "There was an error submitting your application. Please try again.",
      })
    }
    setStatusBtn({ loadingDraft: false, loadingSubmit: false })
  }

  const handleDraft = async () => {
    setStatusBtn({ loadingDraft: true, loadingSubmit: false })
    try {
      await submitMutation.mutateAsync("draft")
      toast.success("Draft Saved", {
        description: "Your draft has been successfully saved.",
      })
    } catch {
      toast.error("Error Saving Draft", {
        description: "There was an error saving your draft. Please try again.",
      })
    }
    setStatusBtn({ loadingDraft: false, loadingSubmit: false })
  }

  // Handle gender specify logic
  const handleGenderChange = useCallback(
    (value: string) => {
      handleChange("gender", value)
      if (value !== "Specify") {
        handleChange("gender_specify", "")
      }
    },
    [handleChange],
  )

  // Resolve display gender for select
  const displayGender = useMemo(() => {
    const g = values.gender as string
    if (g && !GENDER_OPTIONS.some((opt) => opt.value === g)) return "Specify"
    return g ?? ""
  }, [values.gender])

  // Group custom fields by section
  const sectionedFields = useMemo(() => {
    const bySection: Record<string, [string, FormFieldSchema][]> = {}

    for (const [name, field] of Object.entries(schema.custom_fields)) {
      const section = field.section || "Additional Information"
      if (!bySection[section]) bySection[section] = []
      bySection[section].push([`custom_${name}`, field])
    }

    // Use schema.sections order if available
    const orderedSections: {
      title: string
      fields: [string, FormFieldSchema][]
    }[] = []

    if (schema.sections?.length) {
      for (const section of schema.sections) {
        if (bySection[section]) {
          orderedSections.push({ title: section, fields: bySection[section] })
          delete bySection[section]
        }
      }
    }

    // Any remaining sections not in schema.sections
    for (const [section, fields] of Object.entries(bySection)) {
      orderedSections.push({ title: section, fields })
    }

    return orderedSections
  }, [schema])

  // Check if base_fields has referral or info_not_shared
  const hasReferral = "referral" in schema.base_fields
  const hasInfoNotShared = "info_not_shared" in schema.base_fields

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 px-8 md:px-12">
        {/* Profile Section - hardcoded, these fields live on Human */}
        <SectionWrapper
          title="Personal Information"
          subtitle="Your basic information helps us identify and contact you."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InputForm
              label="First name"
              id="first_name"
              value={(values.first_name as string) ?? ""}
              onChange={(v) => handleChange("first_name", v)}
              error={errors.first_name}
              isRequired
            />
            <InputForm
              label="Last name"
              id="last_name"
              value={(values.last_name as string) ?? ""}
              onChange={(v) => handleChange("last_name", v)}
              error={errors.last_name}
              isRequired
            />
            <AddonInputForm
              label="Telegram username"
              id="telegram"
              value={(values.telegram as string) ?? ""}
              onChange={(v) => handleChange("telegram", v)}
              error={errors.telegram}
              isRequired
              subtitle={`The primary form of communication during ${popup.name} will be a Telegram group, so create an account if you don't already have one`}
              addon="@"
              placeholder="username"
            />
            <InputForm
              label="Usual location of residence"
              id="residence"
              value={(values.residence as string) ?? ""}
              onChange={(v) => handleChange("residence", v)}
              error={errors.residence}
              placeholder="Healdsburg, California, USA"
              subtitle="Please format it like [City, State/Region, Country]."
            />
            <div className="flex flex-col gap-4 w-full">
              <SelectForm
                label="Gender"
                id="gender"
                value={displayGender}
                onChange={handleGenderChange}
                error={errors.gender}
                isRequired
                options={GENDER_OPTIONS}
              />
              <AnimatePresence>
                {displayGender === "Specify" && (
                  <motion.div {...animationProps}>
                    <InputForm
                      isRequired
                      label="Specify your gender"
                      id="gender_specify"
                      value={(values.gender_specify as string) ?? ""}
                      onChange={(v) => handleChange("gender_specify", v)}
                      error={errors.gender_specify}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <SelectForm
              label="Age"
              id="age"
              value={(values.age as string) ?? ""}
              onChange={(v) => handleChange("age", v)}
              error={errors.age}
              isRequired
              options={ageOptions}
            />
            <InputForm
              label="Organization"
              id="organization"
              value={(values.organization as string) ?? ""}
              onChange={(v) => handleChange("organization", v)}
              error={errors.organization}
            />
            <InputForm
              label="Role"
              id="role"
              value={(values.role as string) ?? ""}
              onChange={(v) => handleChange("role", v)}
              error={errors.role}
            />

            {hasReferral && (
              <InputForm
                label="Did anyone refer you?"
                id="referral"
                value={(values.referral as string) ?? ""}
                onChange={(v) => handleChange("referral", v)}
                error={errors.referral}
                subtitle="List everyone who encouraged you to apply."
              />
            )}
          </div>

          {hasInfoNotShared && (
            <FormInputWrapper>
              <Label>
                Info I&apos;m <strong>NOT</strong> willing to share with other
                attendees
                <p className="text-sm text-muted-foreground mb-2">
                  We will make a directory to make it easier for attendees to
                  coordinate
                </p>
              </Label>
              <MultiSelect
                options={shareableInfo}
                onChange={(selected) =>
                  handleChange("info_not_shared", selected)
                }
                defaultValue={(values.info_not_shared as string[]) ?? []}
              />
            </FormInputWrapper>
          )}
        </SectionWrapper>
        <SectionSeparator />

        {/* Dynamic sections from schema */}
        {sectionedFields.map(({ title, fields }) => (
          <FormSection
            key={title}
            title={title}
            fields={fields}
            values={values}
            errors={errors}
            onChange={handleChange}
          />
        ))}

        {/* Companions section */}
        <CompanionsSection
          allowsSpouse={popup.allows_spouse ?? false}
          allowsChildren={popup.allows_children ?? false}
          companions={companions}
          onCompanionsChange={setCompanions}
        />

        {/* Submit buttons */}
        <div className="flex flex-col w-full gap-6 md:flex-row justify-between items-center pt-6">
          <ButtonAnimated
            loading={statusBtn.loadingDraft}
            disabled={statusBtn.loadingSubmit}
            variant="outline"
            type="button"
            onClick={handleDraft}
            className="w-full md:w-auto"
          >
            Save as draft
          </ButtonAnimated>
          <ButtonAnimated
            loading={statusBtn.loadingSubmit}
            disabled={statusBtn.loadingDraft}
            type="submit"
            className="w-full md:w-auto"
          >
            Submit
          </ButtonAnimated>
        </div>
      </form>
      <ProgressBar progress={progress} />
    </>
  )
}
