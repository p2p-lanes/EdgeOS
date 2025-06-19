import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const DrawerEmailWorldID = ({ open, setOpen, handleCancel, handleSubmit, isLoading, email, setEmail }: {open: boolean, setOpen: (open: boolean) => void, handleCancel: () => void, handleSubmit: (e: React.FormEvent) => void, isLoading: boolean, email: string, setEmail: (email: string) => void}) => {
  const [isValidEmail, setIsValidEmail] = useState(true)

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="mx-4 mb-4 rounded-2xl overflow-hidden">
        <DrawerHeader className="text-left pb-4 px-6 pt-6 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-lg font-semibold">Enter your email</DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground mt-1">
                Please enter your email to continue
              </DrawerDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="px-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  console.log('email',e.target.value)
                  setEmail(e.target.value)
                  setIsValidEmail(validateEmail(e.target.value))
                }}
                className="w-full"
                required
              />
            </div>
          </form>
        </div>

        <DrawerFooter className="flex-row gap-3 pt-4 px-6 pb-6 bg-white overflow-hidden">
          <Button variant="outline" onClick={handleCancel} className="flex-1" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 bg-black hover:bg-black/90 text-white"
            disabled={isLoading || !isValidEmail}
          >
            {isLoading ? "Confirming..." : "Confirm"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
export default DrawerEmailWorldID