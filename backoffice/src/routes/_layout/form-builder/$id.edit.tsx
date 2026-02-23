import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Suspense } from "react"

import { FormFieldsService } from "@/client"
import { FormPageLayout } from "@/components/Common/FormPageLayout"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { FormFieldForm } from "@/components/forms/FormFieldForm"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/_layout/form-builder/$id/edit")({
  component: EditFormFieldPage,
  head: () => ({
    meta: [{ title: "Edit Form Field - EdgeOS" }],
  }),
})

function getFormFieldQueryOptions(fieldId: string) {
  return {
    queryKey: ["form-fields", fieldId],
    queryFn: () => FormFieldsService.getFormField({ fieldId }),
  }
}

function EditFormFieldContent({ fieldId }: { fieldId: string }) {
  const navigate = useNavigate()
  const { data: field } = useSuspenseQuery(getFormFieldQueryOptions(fieldId))

  return (
    <FormFieldForm
      defaultValues={field}
      onSuccess={() => navigate({ to: "/form-builder" })}
    />
  )
}

function EditFormFieldPage() {
  const { id } = Route.useParams()

  return (
    <FormPageLayout
      title="Edit Form Field"
      description="Update form field configuration"
      backTo="/form-builder"
    >
      <QueryErrorBoundary>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <EditFormFieldContent fieldId={id} />
        </Suspense>
      </QueryErrorBoundary>
    </FormPageLayout>
  )
}
