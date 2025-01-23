import { usePathname, useRouter } from "next/navigation"
import useResources from "../hooks/useResources"
import { useEffect } from "react"

const Permissions = ({children}: {children: React.ReactNode}) => {
  const route = usePathname()
  const router = useRouter()
  const {resources} = useResources()

  
  useEffect(() => {
    if(resources.some(resource => resource.path === route)) {
      return;
    }
    router.push('/portal')
  }, [route, router, resources])

  if(resources.some(resource => resource.path === route)) {
    return children
  }
  return <div>You are not authorized to access this page</div>
}
export default Permissions