import { PopupsService } from "@edgeos/api-client"
import { useQuery } from "@tanstack/react-query"
import { useParams, usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { queryKeys } from "@/lib/query-keys"

export function usePopupsQuery() {
  return useQuery({
    queryKey: queryKeys.popups.portal(),
    queryFn: async () => {
      const result = await PopupsService.listPortalPopups()
      return result.filter((p) => p.status === "active").reverse()
    },
  })
}

export function usePopupsRedirect() {
  const { data: popups = [] } = usePopupsQuery()
  const router = useRouter()
  const { popupSlug } = useParams()
  const pathname = usePathname()

  useEffect(() => {
    if (popups.length === 0) return
    if (pathname === "/portal/poaps" || pathname === "/portal/profile") return

    const findCity = (slug?: string) =>
      popups.find((city) => (slug ? city.slug === slug : true))

    if (!popupSlug || !findCity(popupSlug as string)) {
      const selectedCity = findCity()
      if (selectedCity) router.push(`/portal/${selectedCity.slug}`)
    }
  }, [popups, popupSlug, pathname, router])
}

export default usePopupsQuery
