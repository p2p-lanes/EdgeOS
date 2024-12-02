"use client"

import { Button } from "@/components/ui/button"
import { useFormValidation } from "@/hooks/useFormValidation"
import { Toaster, toast } from "sonner"
import { Loader } from '../../../../components/ui/Loader'
import { ExistingApplicationCard } from '../components/existing-application-card'
import { FormHeader } from '../components/form-header'
import { SectionSeparator } from '../components/section-separator'
import { PersonalInformationForm } from '../components/personal-information-form'
import { ProfessionalDetailsForm } from '../components/professional-details-form'
import { ParticipationForm } from '../components/participation-form'
import { ChildrenPlusOnesForm } from '../components/children-plus-ones-form'
import { ScholarshipForm } from '../components/scolarship-form'
import { ProgressBar } from '../components/progress-bar'
import useSavesForm from '../hooks/useSavesForm'
import useProgress from '../hooks/useProgress'
import { initial_data } from '../helpers/constants'
import useInitForm from '../hooks/useInitForm'

export default function FormPage() {
  const { formData, errors, handleChange, validateForm, setFormData } = useFormValidation(initial_data)
  const { isLoading, showExistingCard, existingApplication, setShowExistingCard } = useInitForm(setFormData)
  const { handleSaveForm, handleSaveDraft } = useSavesForm()
  const progress = useProgress(formData)

  const handleImport = async () => {
    if (existingApplication) {
      setFormData(existingApplication);
      setShowExistingCard(false);
      if(typeof window === 'undefined') return;
      window?.localStorage?.setItem('hasSeenExistingApplicationModal', 'true');
      toast.success("Previous application data imported successfully");
    }
  }

  const handleCancelImport = () => {
    setShowExistingCard(false);
    if(typeof window === 'undefined') return;
    window?.localStorage?.setItem('hasSeenExistingApplicationModal', 'true');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validationResult = validateForm()
    if (validationResult.isValid) {
      // Form is valid, proceed with submission
      handleSaveForm(formData)
    } else {
      // Form is invalid, show error message
      const missingFields = validationResult.errors.map(error => error.field).join(', ')
      toast.error("Error", {
        description: `Please fill in the following required field: ${missingFields}`,
      })
    }
  }

  const handleDraft = () => {
    handleSaveDraft(formData)
  }

  if (isLoading) {
    return <Loader />
  }

  return (
    <main className="container py-6 md:py-12 mb-8">
      <Toaster />
      {showExistingCard && existingApplication && (
        <ExistingApplicationCard onImport={handleImport} onCancel={handleCancelImport} data={existingApplication} />
      )}
      <form onSubmit={handleSubmit} className="space-y-8 px-8 md:px-12">
        <FormHeader />
        <SectionSeparator />
        <PersonalInformationForm formData={formData} errors={errors} handleChange={handleChange} />
        <SectionSeparator />
        <ProfessionalDetailsForm formData={formData} errors={errors} handleChange={handleChange} />
        <SectionSeparator />
        <ParticipationForm formData={formData} errors={errors} handleChange={handleChange} />
        <SectionSeparator />
        <ChildrenPlusOnesForm formData={formData} errors={errors} handleChange={handleChange} />
        <SectionSeparator />
        <ScholarshipForm formData={formData} errors={errors} handleChange={handleChange} />
        <SectionSeparator />
        <div className="flex justify-between items-center pt-6">
          <Button variant="outline" type="button" onClick={handleDraft}>Save as draft</Button>
          <Button type="submit">Submit application</Button>
        </div>
      </form>
      <ProgressBar progress={progress} />
    </main>
  )
}

