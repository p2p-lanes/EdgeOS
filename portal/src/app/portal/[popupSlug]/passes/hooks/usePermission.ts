import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useApplication } from "@/providers/applicationProvider"

const usePermission = () => {
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication()
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (application === null) return

    if (application && application.status !== "accepted") {
      router.replace(`/portal/${params.popupSlug}`)
      return
    }
  }, [application, params.popupSlug, router.replace])
}
export default usePermission
