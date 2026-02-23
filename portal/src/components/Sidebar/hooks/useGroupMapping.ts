import { useMemo } from "react"
import { useGroupsQuery } from "./useGetGroups"

const useGroupMapping = () => {
  const { data: groups = [], isLoading } = useGroupsQuery()

  const groupMapping = useMemo(() => {
    return groups.reduce<Record<string, string>>((acc, group) => {
      acc[group.id] = group.name
      return acc
    }, {})
  }, [groups])

  return {
    groupMapping,
    isLoading,
    groups,
  }
}

export default useGroupMapping
