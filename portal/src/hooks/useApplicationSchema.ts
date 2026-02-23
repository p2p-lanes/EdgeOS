import { FormFieldsService } from "@edgeos/api-client"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import type { ApplicationFormSchema } from "@/types/form-schema"

export function useApplicationSchema(popupId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.formSchema.portal(popupId ?? ""),
    queryFn: async () => {
      const result = await FormFieldsService.getPortalApplicationSchema({
        popupId: popupId!,
      })
      return result as unknown as ApplicationFormSchema
    },
    enabled: !!popupId,
    staleTime: 5 * 60 * 1000,
  })
}
