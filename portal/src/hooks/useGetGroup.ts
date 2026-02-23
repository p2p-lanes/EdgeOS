import { GroupsService, type GroupWithMembers } from "@edgeos/api-client"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"

interface UseGetGroupResult {
  group: GroupWithMembers | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const useGetGroup = (groupId: string | null): UseGetGroupResult => {
  const query = useQuery({
    queryKey: queryKeys.groups.detail(groupId ?? ""),
    queryFn: async () => {
      const result = await GroupsService.getMyGroup({ groupId: groupId! })
      return result
    },
    enabled: !!groupId,
  })

  return {
    group: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: async () => {
      await query.refetch()
    },
  }
}

export default useGetGroup
