import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import useResources from "../hooks/useResources"

const Permissions = ({ children }: { children: React.ReactNode }) => {
  const route = usePathname()
  const router = useRouter()
  const { resources } = useResources()

  useEffect(() => {
    if (
      resources.some(
        (resource) => resource.path === route && resource.status === "active",
      )
    ) {
      return
    }
    router.push("/portal")
  }, [route, router, resources])

  if (
    resources.some(
      (resource) => resource.path === route && resource.status === "active",
    )
  ) {
    return children
  }
  return <div>You are not authorized to access this page</div>
}
export default Permissions
