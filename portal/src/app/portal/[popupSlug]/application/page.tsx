"use client"

import type { ApplicationPublic } from "@edgeos/api-client"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Loader } from "@/components/ui/Loader"
import { useApplicationSchema } from "@/hooks/useApplicationSchema"
import { useApplication } from "@/providers/applicationProvider"
import { useCityProvider } from "@/providers/cityProvider"
import { DynamicApplicationForm } from "./components/dynamic-application-form"
import { ExistingApplicationCard } from "./components/existing-application-card"
import { FormHeader } from "./components/form-header"
import { SectionSeparator } from "./components/section-separator"

function useFormInitData() {
  const { getCity, getPopups } = useCityProvider()
  const { applications, getRelevantApplication } = useApplication()
  const city = getCity()
  const popups = getPopups()
  const application = getRelevantApplication()

  return useMemo(() => {
    if (!city || !applications) return { application: null, importSource: null }

    // If there's a draft/in-review for this popup, edit it
    if (application) {
      return { application, importSource: null }
    }

    // Otherwise, look for an accepted application from another popup to import
    const accepted = applications
      .filter((app) => app.status === "accepted" && app.popup_id !== city.id)
      .sort(
        (a, b) =>
          new Date(b.updated_at || "").getTime() -
          new Date(a.updated_at || "").getTime(),
      )

    // Prefer one from the most recent popup
    const sortedPopups = [...popups].sort(
      (a, b) =>
        new Date(b.end_date ?? "").getTime() -
        new Date(a.end_date ?? "").getTime(),
    )

    for (const popup of sortedPopups) {
      const match = accepted.find((app) => app.popup_id === popup.id)
      if (match) return { application: null, importSource: match }
    }

    return { application: null, importSource: null }
  }, [city, applications, application, popups])
}

export default function FormPage() {
  const { getCity } = useCityProvider()
  const { getRelevantApplication } = useApplication()
  const city = getCity()
  const application = getRelevantApplication()
  const router = useRouter()

  const {
    data: schema,
    isLoading: schemaLoading,
    isError,
  } = useApplicationSchema(city?.id)
  const { application: existingApp, importSource } = useFormInitData()

  const [showImport, setShowImport] = useState(false)
  const [importedData, setImportedData] = useState<ApplicationPublic | null>(
    null,
  )

  // Show import dialog when import source is found
  useEffect(() => {
    if (importSource && !existingApp) {
      setShowImport(true)
    }
  }, [importSource, existingApp])

  // Redirect if already accepted/rejected
  useEffect(() => {
    if (
      application &&
      (application.status === "accepted" || application.status === "rejected")
    ) {
      router.push(`/portal/${city?.slug}`)
    }
  }, [application, city, router])

  const handleImport = () => {
    if (importSource) {
      setImportedData(importSource)
      setShowImport(false)
      toast.success("Previous application data imported successfully")
    }
  }

  const handleCancelImport = () => {
    setShowImport(false)
  }

  if (schemaLoading || !city) {
    return <Loader />
  }

  if (isError || !schema) {
    return (
      <main className="container py-6 md:py-12 mb-8">
        <div className="text-center space-y-4 px-8">
          <h2 className="text-2xl font-bold">Application Unavailable</h2>
          <p className="text-muted-foreground">
            The application form for this event is not yet configured.
          </p>
        </div>
      </main>
    )
  }

  // Determine which data to pre-fill:
  // 1. Existing draft/in-review for this popup
  // 2. Imported data from accepted app in another popup
  const prefillData = existingApp ?? importedData

  return (
    <main className="container py-6 md:py-12 mb-8">
      {showImport && importSource && (
        <ExistingApplicationCard
          onImport={handleImport}
          onCancel={handleCancelImport}
          data={importSource}
        />
      )}
      <div className="space-y-8 px-8 md:px-12">
        <FormHeader />
        <SectionSeparator />
      </div>
      <DynamicApplicationForm
        schema={schema}
        existingApplication={prefillData}
        popup={city}
      />
    </main>
  )
}
