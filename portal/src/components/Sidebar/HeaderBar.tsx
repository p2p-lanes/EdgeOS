import { ChevronRight } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Fragment } from "react"
import { useCityProvider } from "@/providers/cityProvider"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../ui/breadcrumb"
import BreadcrumbSegment from "./BreadcrumbSegment"
import useGroupMapping from "./hooks/useGroupMapping"
import { SidebarTrigger } from "./SidebarComponents"

const HeaderBar = () => {
  const { getCity } = useCityProvider()
  const pathname = usePathname()
  const city = getCity()
  const router = useRouter()
  const { groupMapping, isLoading } = useGroupMapping()

  const handleClickCity = () => {
    router.push(`/portal/${city?.slug}`)
  }

  const pathSegments = pathname.split("/").filter(Boolean).slice(2)
  const pathsToDisplay =
    pathSegments.length > 0 ? pathSegments : ["application"]

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-white px-6">
      <SidebarTrigger />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button type="button" onClick={handleClickCity}>
                {city?.name}
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {pathsToDisplay.map((path) => (
            <Fragment key={path}>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbSegment
                path={path}
                isLoading={isLoading}
                groupMapping={groupMapping}
              />
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}

export default HeaderBar
