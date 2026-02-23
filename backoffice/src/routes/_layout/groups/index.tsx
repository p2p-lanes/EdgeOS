import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"
import {
  EllipsisVertical,
  Eye,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react"
import { Suspense, useState } from "react"

import { type GroupPublic, GroupsService } from "@/client"
import { DataTable, SortableHeader } from "@/components/Common/DataTable"
import { EmptyState } from "@/components/Common/EmptyState"
import { QueryErrorBoundary } from "@/components/Common/QueryErrorBoundary"
import { StatusBadge } from "@/components/Common/StatusBadge"
import { WorkspaceAlert } from "@/components/Common/WorkspaceAlert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoadingButton } from "@/components/ui/loading-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useWorkspace } from "@/contexts/WorkspaceContext"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import {
  useTableSearchParams,
  validateTableSearch,
} from "@/hooks/useTableSearchParams"
import { createErrorHandler } from "@/utils"

function getGroupsQueryOptions(
  popupId: string | null,
  page: number,
  pageSize: number,
  search?: string,
) {
  return {
    queryFn: () =>
      GroupsService.listGroups({
        popupId: popupId ?? undefined,
        skip: page * pageSize,
        limit: pageSize,
        search: search || undefined,
      }),
    queryKey: ["groups", { popupId, page, pageSize, search }],
  }
}

export const Route = createFileRoute("/_layout/groups/")({
  component: Groups,
  validateSearch: validateTableSearch,
  head: () => ({
    meta: [{ title: "Groups - EdgeOS" }],
  }),
})

function AddGroupButton() {
  return (
    <Button asChild>
      <Link to="/groups/new">
        <Plus className="mr-2 h-4 w-4" />
        Add Group
      </Link>
    </Button>
  )
}

function ViewGroupMembers({ group }: { group: GroupPublic }) {
  const [isOpen, setIsOpen] = useState(false)

  const {
    data: groupWithMembers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["groups", group.id],
    queryFn: () => GroupsService.getGroup({ groupId: group.id }),
    enabled: isOpen,
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Users className="mr-2 h-4 w-4" />
        View Members
      </DropdownMenuItem>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Group Members: {group.name}</DialogTitle>
          <DialogDescription>Members of this group</DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[50vh] overflow-y-auto">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : isError ? (
            <p className="text-center text-destructive">
              Failed to load members
            </p>
          ) : groupWithMembers?.members &&
            groupWithMembers.members.length > 0 ? (
            <div className="space-y-2">
              {groupWithMembers.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No members yet</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteGroup({
  group,
  onSuccess,
}: {
  group: GroupPublic
  onSuccess: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: () => GroupsService.deleteGroup({ groupId: group.id }),
    onSuccess: () => {
      showSuccessToast("Group deleted successfully")
      setIsOpen(false)
      onSuccess()
    },
    onError: createErrorHandler(showErrorToast),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["groups"] }),
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem
        variant="destructive"
        onSelect={(e) => e.preventDefault()}
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Group</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete group "{group.name}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <LoadingButton
            variant="destructive"
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Delete
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function GroupActionsMenu({ group }: { group: GroupPublic }) {
  const [open, setOpen] = useState(false)
  const { isAdmin } = useAuth()

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Group actions">
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/groups/$id/edit" params={{ id: group.id }}>
            {isAdmin ? (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                View
              </>
            )}
          </Link>
        </DropdownMenuItem>
        <ViewGroupMembers group={group} />
        {isAdmin && (
          <DeleteGroup group={group} onSuccess={() => setOpen(false)} />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const columns: ColumnDef<GroupPublic>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader label="Name" column={column} />,
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "discount_percentage",
    header: ({ column }) => <SortableHeader label="Discount" column={column} />,
    cell: ({ row }) => <span>{row.original.discount_percentage}%</span>,
  },
  {
    accessorKey: "max_members",
    header: "Max Members",
    cell: ({ row }) => <span>{row.original.max_members ?? "Unlimited"}</span>,
  },
  {
    accessorKey: "is_ambassador_group",
    header: "Type",
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.is_ambassador_group ? "ambassador" : "regular"}
      />
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <GroupActionsMenu group={row.original} />
      </div>
    ),
  },
]

function GroupsTableContent() {
  const { selectedPopupId } = useWorkspace()
  const searchParams = Route.useSearch()
  const { search, pagination, setSearch, setPagination } = useTableSearchParams(
    searchParams,
    "/groups",
  )

  const { data: groups } = useQuery({
    ...getGroupsQueryOptions(
      selectedPopupId,
      pagination.pageIndex,
      pagination.pageSize,
      search,
    ),
    placeholderData: keepPreviousData,
  })

  if (!groups) return <Skeleton className="h-64 w-full" />

  return (
    <DataTable
      columns={columns}
      data={groups.results}
      searchPlaceholder="Search by name..."
      hiddenOnMobile={["max_members", "is_ambassador_group"]}
      searchValue={search}
      onSearchChange={setSearch}
      serverPagination={{
        total: groups.paging.total,
        pagination: pagination,
        onPaginationChange: setPagination,
      }}
      emptyState={
        !search ? (
          <EmptyState
            icon={Users}
            title="No groups yet"
            description="Create groups to manage team registrations and offer group discounts."
            action={
              <Button asChild>
                <Link to="/groups/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Group
                </Link>
              </Button>
            }
          />
        ) : undefined
      }
    />
  )
}

function Groups() {
  const { isAdmin } = useAuth()
  const { isContextReady } = useWorkspace()

  return (
    <div className="flex flex-col gap-6">
      {!isContextReady && <WorkspaceAlert resource="groups" />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">
            Manage group registrations and discounts
          </p>
        </div>
        {isAdmin && isContextReady && <AddGroupButton />}
      </div>
      {isContextReady && (
        <QueryErrorBoundary>
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <GroupsTableContent />
          </Suspense>
        </QueryErrorBoundary>
      )}
    </div>
  )
}
