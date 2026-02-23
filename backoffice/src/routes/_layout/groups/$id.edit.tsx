import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Suspense } from "react"

import { GroupsService } from "@/client"
import { FormPageLayout } from "@/components/Common/FormPageLayout"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { GroupForm } from "@/components/forms/GroupForm"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/_layout/groups/$id/edit")({
  component: EditGroupPage,
  head: () => ({
    meta: [{ title: "Edit Group - EdgeOS" }],
  }),
})

function getGroupQueryOptions(groupId: string) {
  return {
    queryKey: ["groups", groupId],
    queryFn: () => GroupsService.getGroup({ groupId }),
  }
}

function EditGroupContent({ groupId }: { groupId: string }) {
  const navigate = useNavigate()
  const { data: group } = useSuspenseQuery(getGroupQueryOptions(groupId))

  return (
    <GroupForm
      defaultValues={group}
      onSuccess={() => navigate({ to: "/groups" })}
    />
  )
}

function EditGroupPage() {
  const { id } = Route.useParams()

  return (
    <FormPageLayout
      title="Edit Group"
      description="Update group settings and discounts"
      backTo="/groups"
    >
      <QueryErrorBoundary>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <EditGroupContent groupId={id} />
        </Suspense>
      </QueryErrorBoundary>
    </FormPageLayout>
  )
}
