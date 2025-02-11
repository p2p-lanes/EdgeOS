import { useApplication } from "@/providers/applicationProvider";
import { useRouter } from "next/navigation";

import { useParams } from "next/navigation";
import { useEffect } from "react";

const usePermission = () => {
  const { getRelevantApplication } = useApplication()
  const application = getRelevantApplication();
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if(application === null) return;

    if(application && application.status !== 'accepted'){
      router.replace(`/portal/${params.popupSlug}`)
      return;
    }
  }, [application])
}
export default usePermission