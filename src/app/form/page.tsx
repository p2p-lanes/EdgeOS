"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PersonalInformationForm } from "@/components/personal-information-form"
import { ProfessionalDetailsForm } from "@/components/professional-details-form"
import { ParticipationForm } from "@/components/participation-form"
import { ChildrenPlusOnesForm } from "@/components/children-plus-ones-form"
import { ScholarshipForm } from "@/components/scholarship-form"
import { SectionSeparator } from "@/components/section-separator"
import { FormHeader } from "@/components/form-header"
import { Button } from "@/components/ui/button"
import { useFormValidation } from "@/hooks/useFormValidation"
import { Toaster, toast } from "sonner"
import { ExistingApplicationCard } from "@/components/existing-application-card"
import { ProgressBar } from "@/components/progress-bar"
import { FormLoader } from "@/components/form-loader"

// Simulated function to check if user exists
const checkUserExists = async (email: string): Promise<boolean> => {
  // This is a mock implementation. In a real scenario, this would be an API call.
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  return email === "existing@example.com"; // For demonstration, assume this email has an existing application
}

// Simulated function to fetch existing application data
const fetchExistingApplication = async (email: string): Promise<any> => {
  // This is a mock implementation. In a real scenario, this would be an API call.
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  return {
    firstName: 'John',
    lastName: 'Doe',
    email: 'existing@example.com',
    applicationDate: '2023-11-15',
    event: 'Edge Esmeralda 2024',
    // ... other fields
  };
}

// New function to check for draft
const checkForDraft = async (): Promise<any> => {
  // This is a placeholder function. You will implement the actual API call later.
  // For now, we'll simulate an API call that returns a draft.
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  return {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    telegram: '@janesmith',
    organization: 'Tech Innovators',
    role: 'Software Engineer',
    // ... other fields as needed
  };
}

export default function FormPage() {
  const router = useRouter()
  const [showExistingCard, setShowExistingCard] = useState(false)
  const [existingApplication, setExistingApplication] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { formData, errors, handleChange, validateForm, setFormData } = useFormValidation({
    // Initialize with empty values for all required fields
    firstName: '', lastName: '', email: '', telegram: '',
    organization: '', gender: '', age: '', socialMedia: '',
    duration: '', checkIn: '', checkOut: '', isBuilder: false, builderRole: '', successLookLike: [], topicTracks: [],
    hasSpouse: false, spouseName: '', spouseEmail: '', hasKids: false, kidsInfo: '',
    isScholarshipInterested: false, scholarshipType: [], scholarshipReason: ''
  })

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const initializeForm = async () => {
      setIsLoading(true)
      try {
        const userEmail = "existing@example.com"; // This would normally come from your authentication system
        const [exists, draft] = await Promise.all([
          checkUserExists(userEmail),
          checkForDraft()
        ]);

        if (exists) {
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
        fields: ['firstName', 'lastName', 'email', 'telegram'],
        required: true
      },
      {
        name: 'professionalDetails',
        fields: ['organization', 'gender', 'age', 'socialMedia'],
        required: true
      },
      {
        name: 'participation',
        fields: ['duration', 'checkIn', 'checkOut', 'successLookLike', 'topicTracks'],
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
      console.log('Form submitted:', formData)
      toast.success("Application Submitted", {
        description: "Your application has been successfully submitted.",
      })
    } else {
      // Form is invalid, show error message
      const missingFields = validationResult.errors.map(error => error.field).join(', ')
      toast.error("Error", {
        description: `Please fill in the following required field: ${missingFields}`,
      })
    }
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
          <Button variant="outline" type="button">Save as draft</Button>
          <Button type="submit">Submit application</Button>
        </div>
      </form>
      <ProgressBar progress={progress} />
    </main>
  )
}

