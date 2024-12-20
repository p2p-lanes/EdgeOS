import { ChevronRight } from "lucide-react"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb"
import { SidebarTrigger } from "./SidebarComponents"
import { useCityProvider } from "@/providers/cityProvider"
import { usePathname, useRouter } from 'next/navigation'
import { Fragment } from "react"

const HeaderBar = () => {
  const { getCity } = useCityProvider()
  const pathname = usePathname()
  const city = getCity()
  const router = useRouter()
  
  const handleClickCity = () => {
    router.push(`/portal/${city?.slug}`)
  }
  
  const splitPath = pathname.split('/').filter(Boolean).slice(2); // Eliminar los dos primeros elementos

  // Si splitPath está vacío, agregar "application"
  const pathsToDisplay = splitPath.length > 0 ? splitPath : ['application'];

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-6 w-[100%]">
      <SidebarTrigger />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="cursor-pointer" onClick={handleClickCity}>{city?.name}</BreadcrumbPage>
          </BreadcrumbItem>
  
          {pathsToDisplay.map((path, index) => (
            <Fragment key={index}>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink>{path.charAt(0).toUpperCase() + path.slice(1)}</BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
export default HeaderBar