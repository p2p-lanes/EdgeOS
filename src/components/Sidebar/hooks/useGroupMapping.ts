import useGetGroups from "./useGetGroups"
import { useMemo } from "react"

/**
 * Hook que proporciona un mapeo de IDs de grupos a sus nombres
 * @returns Un objeto con el mapeo, estado de carga y grupos
 */
const useGroupMapping = () => {
  const { groups, isLoading } = useGetGroups()
  
  // Crear un objeto de mapeo {id: nombre} de forma memoizada
  const groupMapping = useMemo(() => {
    return groups.reduce<Record<string, string>>((acc, group) => {
      acc[group.id] = group.name
      return acc
    }, {})
  }, [groups])
  
  return {
    groupMapping,
    isLoading,
    groups
  }
}

export default useGroupMapping 