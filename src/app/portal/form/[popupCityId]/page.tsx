"use client"


import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useFormValidation } from "@/hooks/useFormValidation"
import { Toaster, toast } from "sonner"
import { checkForDraft, getUser, fetchExistingApplication } from '../helpers/getData'
import { api } from '@/api'
import { FormLoader } from '../components/form-loader'
import { ExistingApplicationCard } from '../components/existing-application-card'
import { FormHeader } from '../components/form-header'
import { SectionSeparator } from '../components/section-separator'
import { PersonalInformationForm } from '../components/personal-information-form'
import { ProfessionalDetailsForm } from '../components/professional-details-form'
import { ParticipationForm } from '../components/participation-form'
import { ChildrenPlusOnesForm } from '../components/children-plus-ones-form'
import { ScholarshipForm } from '../components/scholarship-form'
import { ProgressBar } from '../components/progress-bar'

export default function FormPage() {
  const [showExistingCard, setShowExistingCard] = useState(false)
  const [existingApplication, setExistingApplication] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { formData, errors, handleChange, validateForm, setFormData } = useFormValidation({
    // Initialize with empty values for all required fields
    first_name: '', last_name: '', email: '', telegram_username: '',
    organization: '', gender: '', age: '', socialMedia: '',
    duration: '', checkIn: '', checkOut: '', isBuilder: false, builderRole: '', successLookLike: [], topicTracks: [],
    hasSpouse: false, spouseName: '', spouseEmail: '', hasKids: false, kidsInfo: '', hostSession: '',
    isScholarshipInterested: false, scholarshipType: [], scholarshipReason: ''
  })

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
          const hasSeenModal = localStorage.getItem('hasSeenExistingApplicationModal');
          if (!hasSeenModal) {
            setShowExistingCard(true);
          }
        }

        if (draft) {
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
        fields: ['first_name', 'last_name', 'email', 'telegram_username', 'gender', 'age'],
        required: true
      },
      {
        name: 'professionalDetails',
        fields: ['organization', 'socialMedia'],
        required: true
      },
      {
        name: 'participation',
        fields: ['duration', 'checkIn', 'checkOut', 'successLookLike', 'topicTracks', 'hostSession'],
        required: true
      },
      {
        name: 'builderRole',
        fields: ['builderRole'],
        required: formData.isBuilder
      },
      {
        name: 'spouse',
        fields: ['spouseName', 'spouseEmail'],
        required: formData.hasSpouse
      },
      {
        name: 'kids',
        fields: ['kidsInfo'],
        required: formData.hasKids
      },
      {
        name: 'scholarship',
        fields: ['scholarshipType', 'scholarshipReason'],
        required: formData.isScholarshipInterested
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
      localStorage.setItem('hasSeenExistingApplicationModal', 'true');
      toast.success("Previous application data imported successfully");
    }
  }

  const handleCancelImport = () => {
    setShowExistingCard(false);
    localStorage.setItem('hasSeenExistingApplicationModal', 'true');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validationResult = validateForm()
    if (validationResult.isValid) {
      // Form is valid, proceed with submission
      api.post('applications', formData).then(() => {
        toast.success("Application Submitted", {
          description: "Your application has been successfully submitted.",
        })
      })
      console.log('Form submitted:', formData)
    } else {
      // Form is invalid, show error message
      const missingFields = validationResult.errors.map(error => error.field).join(', ')
      toast.error("Error", {
        description: `Please fill in the following required field: ${missingFields}`,
      })
    }
  }

  const handleSaveDraft = () => {
    console.log('formData', formData)
    api.post('applications', formData).then(d => console.log('ddd', d))
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
          name={`${existingApplication.firstName} ${existingApplication.lastName}`}
          applicationDate={existingApplication.applicationDate}
          event={existingApplication.event}
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
          <Button variant="outline" type="button" onClick={handleSaveDraft}>Save as draft</Button>
          <Button type="submit">Submit application</Button>
        </div>
      </form>
      <ProgressBar progress={progress} />
    </main>
  )
}

