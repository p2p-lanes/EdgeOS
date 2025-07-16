"use client"

import { ButtonAnimated } from "@/components/ui/button"
import { useFormValidation } from "@/hooks/useFormValidation"
import { toast } from "sonner"
import { Loader } from '../../../../components/ui/Loader'
import { ExistingApplicationCard } from './components/existing-application-card'
import { FormHeader } from './components/form-header'
import { SectionSeparator } from './components/section-separator'
import { PersonalInformationForm } from './components/personal-information-form'
import { ProfessionalDetailsForm } from './components/professional-details-form'
import { ParticipationForm } from './components/participation-form'
import { ChildrenPlusOnesForm } from './components/children-plus-ones-form'
import { ScholarshipForm } from './components/scholarship-form'
import { ProgressBar } from './components/progress-bar'
import useSavesForm from './hooks/useSavesForm'
import useProgress from './hooks/useProgress'
import { initial_data } from './helpers/constants'
import useInitForm from './hooks/useInitForm'
import { useCityProvider } from "@/providers/cityProvider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { dynamicForm } from "../../../../constants"
import AccomodationForm from "./components/AccomodationForm"
import { useApplication } from "@/providers/applicationProvider"
import useGetFields from "./hooks/useGetFields"
import PatagoniaResidenciesForm from "./components/PatagoniaResidenciesForm"

export default function FormPage() {
  const [statusBtn, setStatusBtn] = useState({loadingDraft: false, loadingSubmit: false})
  const { formData, errors, handleChange, validateForm, setFormData } = useFormValidation(initial_data)
  const { isLoading: isLoadingForm, showExistingCard, existingApplication, setShowExistingCard } = useInitForm(setFormData)
  const { handleSaveForm, handleSaveDraft } = useSavesForm()
  const { getCity } = useCityProvider()
  const { getRelevantApplication } = useApplication()
  const { fields } = useGetFields()
  const progress = useProgress(formData)
  const city = getCity()
  const application = getRelevantApplication()
  const router = useRouter()

  useEffect(() => {
    if(city && city.slug && fields?.size === 0) {
      router.push(`/portal/${city?.slug}`)
      return;
    }
    if(application && (application.status === 'accepted' || application.status === 'rejected')) {
      router.push(`/portal/${city?.slug}`)
    }
  }, [application, city, fields])

  const handleImport = async () => {
    if (existingApplication && fields) {
      const filteredData = Object.fromEntries(
        Object.entries(existingApplication).filter(([key]) => fields.has(key))
      );
      setFormData(filteredData as Record<string, any>);
      setShowExistingCard(false);
      toast.success("Previous application data imported successfully");
    }
  }

  const handleCancelImport = () => {
    setShowExistingCard(false);
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

  if(!fields || !fields.size) return null

  return (
    <main className="container py-6 md:py-12 mb-8">
      {showExistingCard && existingApplication && (
        <ExistingApplicationCard onImport={handleImport} onCancel={handleCancelImport} data={existingApplication} />
      )}
      <form onSubmit={handleSubmit} className="space-y-8 px-8 md:px-12">
        <FormHeader />
        <SectionSeparator />

        <PersonalInformationForm formData={formData} errors={errors} handleChange={handleChange} fields={fields}/>
        
        <ProfessionalDetailsForm formData={formData} errors={errors} handleChange={handleChange} fields={fields}/>

        <ParticipationForm formData={formData} errors={errors} handleChange={handleChange} fields={fields}/>

        <PatagoniaResidenciesForm formData={formData} errors={errors} handleChange={handleChange} fields={fields}/>

        <ChildrenPlusOnesForm formData={formData} errors={errors} handleChange={handleChange} fields={fields}/>

        <ScholarshipForm formData={formData} errors={errors} handleChange={handleChange} fields={fields}/>

        <AccomodationForm formData={formData} errors={errors} handleChange={handleChange} fields={fields}/>
        
        <div className="flex flex-col w-full gap-6 md:flex-row justify-between items-center pt-6">
          <ButtonAnimated loading={statusBtn.loadingDraft} disabled={statusBtn.loadingSubmit} variant="outline" type="button" onClick={handleDraft} className="w-full md:w-auto">Save as draft</ButtonAnimated>
          <ButtonAnimated loading={statusBtn.loadingSubmit} disabled={statusBtn.loadingDraft} type="submit" className="w-full md:w-auto">Submit</ButtonAnimated>
        </div>

      </form>
      <ProgressBar progress={progress} />
    </main>
  )
}

