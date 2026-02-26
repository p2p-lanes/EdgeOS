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
import { splitForCreate, splitForUpdate } from "@/lib/form-data-splitter"
import { queryKeys } from "@/lib/query-keys"
import { useApplication } from "@/providers/applicationProvider"
import type {
  ApplicationFormSchema,
  FormFieldSchema,
} from "@/types/form-schema"
import { useApplicationForm } from "../hooks/use-application-form"
import { CompanionsSection, type CompanionWithId } from "./companions-section"
import { DynamicField } from "./fields/dynamic-field"
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

const FULL_WIDTH_TYPES = new Set(["textarea", "multiselect"])

function mapOptions(options?: string[]) {
  return (options ?? []).map((opt) => ({ value: opt, label: opt }))
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
          requestBody: splitForUpdate({ values, status, schema }),
        })
      }

      return ApplicationsService.createMyApplication({
        requestBody: splitForCreate({
          values,
          popupId: popup.id,
          companions: companionPayload,
          status,
          schema,
        }),
      })
    },
    onSuccess: (result) => {
      updateApplication(result)
      queryClient.invalidateQueries({ queryKey: queryKeys.applications.mine() })
    },
  })

  const handleSubmit = async (
    e: Parameters<NonNullable<React.ComponentProps<"form">["onSubmit"]>>[0],
  ) => {
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
    const genderField = schema.base_fields.gender
    if (g && genderField?.options && !genderField.options.includes(g))
      return "Specify"
    return g ?? ""
  }, [values.gender, schema.base_fields])

  // Group base_fields by section, sorted by position
  const baseFieldSections = useMemo(() => {
    const bySection: Record<string, [string, FormFieldSchema][]> = {}

    for (const [name, field] of Object.entries(schema.base_fields)) {
      const section = field.section || "profile"
      if (!bySection[section]) bySection[section] = []
      bySection[section].push([name, field])
    }

    // Sort fields within each section by position
    for (const fields of Object.values(bySection)) {
      fields.sort(([, a], [, b]) => (a.position ?? 0) - (b.position ?? 0))
    }

    return bySection
  }, [schema.base_fields])

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

  /** Render a single base field — special cases inline, rest via DynamicField */
  const renderBaseField = (name: string, field: FormFieldSchema) => {
    // --- Telegram: addon input with @ prefix ---
    if (name === "telegram") {
      return (
        <div key={name}>
          <AddonInputForm
            label={field.label}
            id="telegram"
            value={(values.telegram as string) ?? ""}
            onChange={(v) => handleChange("telegram", v)}
            error={errors.telegram}
            isRequired={field.required}
            subtitle={field.help_text}
            addon="@"
            placeholder={field.placeholder}
          />
        </div>
      )
    }

    // --- Gender: select with animated "Specify" sub-field ---
    if (name === "gender") {
      return (
        <div key={name} className="flex flex-col gap-4 w-full">
          <SelectForm
            label={field.label}
            id="gender"
            value={displayGender}
            onChange={handleGenderChange}
            error={errors.gender}
            isRequired={field.required}
            options={mapOptions(field.options)}
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
      )
    }

    // --- Generic field: rendered via DynamicField ---
    return (
      <div
        key={name}
        className={FULL_WIDTH_TYPES.has(field.type) ? "md:col-span-2" : ""}
      >
        <DynamicField
          name={name}
          field={field}
          value={values[name]}
          error={errors[name]}
          onChange={handleChange}
        />
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8 px-8 md:px-12">
        {/* Base fields grouped by section */}
        {Object.entries(baseFieldSections).map(([section, fields]) => (
          <div key={section}>
            <SectionWrapper
              title={section === "profile" ? "Personal Information" : section}
              subtitle={
                section === "profile"
                  ? "Your basic information helps us identify and contact you."
                  : undefined
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {fields.map(([name, field]) => renderBaseField(name, field))}
              </div>
            </SectionWrapper>
            <SectionSeparator />
          </div>
        ))}

        {/* Dynamic sections from custom fields */}
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
