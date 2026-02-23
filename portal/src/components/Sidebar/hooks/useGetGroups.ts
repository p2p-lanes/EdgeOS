import { GroupsService } from "@edgeos/api-client"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"

export function useGroupsQuery() {
  return useQuery({
    queryKey: queryKeys.groups.mine(),
    queryFn: async () => {
      const result = await GroupsService.listMyGroups()
      return result.results
    },
  })
}

export default useGroupsQuery
