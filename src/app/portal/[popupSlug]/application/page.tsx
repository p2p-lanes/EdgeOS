"use client"

import { Button, ButtonAnimated } from "@/components/ui/button"
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
import { useCityProvider } from "@/providers/cityProvider"
import useWindow from "@/hooks/useWindow"
import { useState } from "react"

export default function FormPage() {
  const [statusBtn, setStatusBtn] = useState({loadingDraft: false, loadingSubmit: false})
  const { formData, errors, handleChange, validateForm, setFormData } = useFormValidation(initial_data)
  const { isLoading: isLoadingForm, showExistingCard, existingApplication, setShowExistingCard } = useInitForm(setFormData)
  const { handleSaveForm, handleSaveDraft } = useSavesForm()
  const { getCity } = useCityProvider()
  const { window } = useWindow()
  const progress = useProgress(formData)
  const city = getCity()

  const handleImport = async () => {
    if (existingApplication) {
      setFormData(existingApplication);
      setShowExistingCard(false);
      window?.localStorage?.setItem('hasSeenExistingApplicationModal', 'true');
      toast.success("Previous application data imported successfully");
    }
  }

  const handleCancelImport = () => {
    setShowExistingCard(false);
    window?.localStorage?.setItem('hasSeenExistingApplicationModal', 'true');
  }

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault()
    setStatusBtn({loadingDraft: false, loadingSubmit: true})
    const formValidation = validateForm()
    if (formValidation.isValid) {
      await handleSaveForm(formData)
    } else {
      const missingFields = formValidation.errors.map(error => error.field).join(', ')
      toast.error("Error", {
        description: `Please fill in the following required field: ${missingFields}`,
      })
    }
    setStatusBtn({loadingDraft: false, loadingSubmit: false})
  }

  const handleDraft = async() => {
    setStatusBtn({loadingDraft: true, loadingSubmit: false})
    await handleSaveDraft(formData)
    setStatusBtn({loadingDraft: false, loadingSubmit: false})
  }

  if (isLoadingForm || !city) {
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
          <ButtonAnimated loading={statusBtn.loadingDraft} disabled={statusBtn.loadingSubmit} variant="outline" type="button" onClick={handleDraft}>Save as draft</ButtonAnimated>
          <ButtonAnimated loading={statusBtn.loadingSubmit} disabled={statusBtn.loadingDraft} type="submit">Submit application</ButtonAnimated>
        </div>
      </form>
      <ProgressBar progress={progress} />
    </main>
  )
}

