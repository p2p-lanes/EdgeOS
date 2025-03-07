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
  
  const splitPath = pathname.split('/').filter(Boolean).slice(1); // Eliminar los dos primeros elementos

  console.log(splitPath)


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-6 w-[100%]">
      <SidebarTrigger />
      <Breadcrumb>
        <BreadcrumbList>
          {/* <BreadcrumbItem>
            <BreadcrumbPage className="cursor-pointer" onClick={handleClickCity}>{city?.name}</BreadcrumbPage>
          </BreadcrumbItem> */}
  
          {splitPath.map((path, index) => (
            <Fragment key={index}>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  {
                    path === city?.slug ? (
                      <BreadcrumbPage className="cursor-pointer" onClick={handleClickCity}>{city?.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbPage>{path.charAt(0).toUpperCase() + path.slice(1)}</BreadcrumbPage>
                    )
                  }
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
export default HeaderBar