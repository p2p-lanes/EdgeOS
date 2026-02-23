import { useNavigate } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

interface FormPageLayoutProps {
  title: string
  description: string
  backTo: string
  children: React.ReactNode
}

export function FormPageLayout({
  title,
  description,
  backTo,
  children,
}: FormPageLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Go back"
          onClick={() => navigate({ to: backTo })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
