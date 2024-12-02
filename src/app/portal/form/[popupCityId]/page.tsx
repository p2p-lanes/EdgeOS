"use client"


import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useFormValidation } from "@/hooks/useFormValidation"
import { Toaster, toast } from "sonner"
import { checkForDraft, getUser, fetchExistingApplication } from '../helpers/getData'
import { FormLoader } from '../components/form-loader'
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

export default function FormPage() {
  const [showExistingCard, setShowExistingCard] = useState(false)
  const [existingApplication, setExistingApplication] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { formData, errors, handleChange, validateForm, setFormData } = useFormValidation({
    // Initialize with empty values for all required fields
    first_name: '', last_name: '', telegram: '',
    organization: '', gender: '', age: '', social_media: '',
    duration: '', check_in: null, check_out: null, builder_boolean: false, builder_description: '', success_definition: [], top_tracks: [],
    brings_spouse: false, spouse_info: '', spouse_email: '', brings_kids: false, kids_info: '', host_session: '',
    scolarship_request: false, scolarship_categories: [], scolarship_details: ''
  })
  const { handleSaveForm, handleSaveDraft } = useSavesForm()

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const initializeForm = async () => {
      setIsLoading(true)
      try {
        const [userEmail, draft] = await Promise.all([
          getUser(),
          checkForDraft()
        ]);

        if (userEmail) {
          const existingData = await fetchExistingApplication(userEmail);
          setExistingApplication(existingData);
          if(typeof window === 'undefined') return;
          const hasSeenModal = window?.localStorage?.getItem('hasSeenExistingApplicationModal');
          if (!hasSeenModal) {
            setShowExistingCard(true);
          }
        }

        if (draft && !showExistingCard) {
          setFormData(prevData => ({
            ...prevData,
            ...draft
          }));
          toast.success("Draft loaded successfully", {
            description: "Your previously saved draft has been loaded.",
          });
        }
      } catch (error) {
        console.error("Error initializing form:", error);
        toast.error("Error", {
          description: "There was an error loading your application data. Please try again.",
        });
      } finally {
        setIsLoading(false)
      }
    }

    initializeForm();
  }, [setFormData]);

  useEffect(() => {
    // Calculate progress based on filled sections
    const sections = [
      {
        name: 'personalInformation',
        fields: ['first_name', 'last_name', 'telegram', 'gender', 'age'],
        required: true
      },
      {
        name: 'professionalDetails',
        fields: ['organization', 'social_media'],
        required: true
      },
      {
        name: 'participation',
        fields: ['duration', 'check_in', 'check_out', 'success_definition', 'top_tracks', 'host_session'],
        required: true
      },
      {
        name: 'builder_description',
        fields: ['builder_description'],
        required: formData.builder_boolean
      },
      {
        name: 'spouse',
        fields: ['spouse_info', 'spouse_email'],
        required: formData.brings_spouse
      },
      {
        name: 'kids',
        fields: ['kids_info'],
        required: formData.brings_kids
      },
      {
        name: 'scolarship_request',
        fields: ['scolarship_categories', 'scolarship_details'],
        required: formData.scolarship_request
      }
    ]

    const totalSections = sections.filter(section => section.required).length
    const filledSections = sections.filter(section => 
      section.required && section.fields.every(field => 
        Array.isArray(formData[field]) ? formData[field].length > 0 : Boolean(formData[field])
      )
    ).length

    setProgress((filledSections / totalSections) * 100)
  }, [formData])

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
    return <FormLoader />
  }

  return (
    <main className="container py-6 md:py-12 mb-8">
      <Toaster />
      {showExistingCard && existingApplication && (
        <ExistingApplicationCard
          onImport={handleImport}
          onCancel={handleCancelImport}
          name={`${existingApplication.first_name} ${existingApplication.last_name}`}
          email={existingApplication.email}
        />
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

