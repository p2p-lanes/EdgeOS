import { ProductsService } from "@edgeos/api-client"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/query-keys"
import type { ProductsPass } from "@/types/Products"

export function useProductsQuery(popupId: string | null) {
  return useQuery({
    queryKey: queryKeys.products.byPopup(popupId ?? ""),
    queryFn: async (): Promise<ProductsPass[]> => {
      const result = await ProductsService.listPortalProducts({
        popupId: popupId!,
      })
      return result.results.map((p) => ({
        ...p,
        price: Number(p.price),
        compare_price: p.compare_price ? Number(p.compare_price) : null,
        category: p.category ?? "other",
      }))
    },
    enabled: !!popupId,
  })
}
