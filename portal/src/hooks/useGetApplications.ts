import { ApplicationsService } from "@edgeos/api-client"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"

export function useApplicationsQuery() {
  return useQuery({
    queryKey: queryKeys.applications.mine(),
    queryFn: async () => {
      const result = await ApplicationsService.listMyApplications()
      return result.results
    },
  })
}

export default useApplicationsQuery
