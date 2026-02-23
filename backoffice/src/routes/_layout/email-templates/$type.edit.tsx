import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { Suspense } from "react"

import { EmailTemplatesService, type EmailTemplateType } from "@/client"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { WorkspaceAlert } from "@/components/Common/WorkspaceAlert"
import { EmailTemplateEditor } from "@/components/EmailTemplateEditor"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorkspace } from "@/contexts/WorkspaceContext"

export const Route = createFileRoute("/_layout/email-templates/$type/edit")({
  component: EditEmailTemplate,
  head: () => ({
    meta: [{ title: "Edit Email Template - EdgeOS" }],
  }),
})

function EditorContent({ templateType }: { templateType: string }) {
  const { selectedPopupId } = useWorkspace()
  const navigate = useNavigate()

  const { data: types } = useQuery({
    queryKey: ["email-template-types"],
    queryFn: () => EmailTemplatesService.listTemplateTypes(),
  })

  const { data: customTemplates } = useQuery({
    queryKey: ["email-templates", selectedPopupId],
    queryFn: () =>
      EmailTemplatesService.listEmailTemplates({
        popupId: selectedPopupId!,
      }),
    enabled: !!selectedPopupId,
  })

  const typeInfo = types?.find((t) => t.type === templateType)
  const existingTemplate = customTemplates?.results?.find(
    (t) => t.template_type === templateType,
  )

  if (!types || !customTemplates) return <Skeleton className="h-96 w-full" />
  if (!typeInfo) return <div>Unknown template type: {templateType}</div>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/email-templates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {typeInfo.label}
          </h1>
          <p className="text-muted-foreground">{typeInfo.description}</p>
        </div>
      </div>

      <EmailTemplateEditor
        templateType={templateType as EmailTemplateType}
        popupId={selectedPopupId!}
        existingTemplate={existingTemplate}
        typeInfo={typeInfo}
        onSave={() => navigate({ to: "/email-templates" })}
      />
    </div>
  )
}

function EditEmailTemplate() {
  const { type } = Route.useParams()
  const { isContextReady } = useWorkspace()

  if (!isContextReady) {
    return (
      <div className="flex flex-col gap-6">
        <WorkspaceAlert resource="email templates" action="create" />
      </div>
    )
  }

  return (
    <QueryErrorBoundary>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <EditorContent templateType={type} />
      </Suspense>
    </QueryErrorBoundary>
  )
}
