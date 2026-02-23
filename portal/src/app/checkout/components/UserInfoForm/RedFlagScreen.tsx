"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RedFlagScreenProps {
  userName: string
  popupName: string
  popupSlug: string
}

const RedFlagScreen = ({
  userName,
  popupName,
  popupSlug,
}: RedFlagScreenProps) => {
  const router = useRouter()

  const handlePortalRedirect = () => {
    router.push(`/portal/${popupSlug}`)
  }

  return (
    <Card className="max-w-lg mx-auto backdrop-blur bg-white/90">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Application Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <p className="text-lg">
            Hi <span className="font-semibold">{userName}</span>, before you can
            purchase a pass, we'd love to get to know you better!
          </p>
          <p className="text-gray-600">
            Please visit the Edge Portal and apply to{" "}
            <span className="font-semibold">{popupName}</span>, so we can review
            your information.
          </p>
        </div>

        <Button onClick={handlePortalRedirect} className="w-full" size="lg">
          Go to Portal
        </Button>
      </CardContent>
    </Card>
  )
}

export default RedFlagScreen
