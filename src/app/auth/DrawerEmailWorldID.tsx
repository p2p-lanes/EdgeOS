import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import Image from "next/image"

const DrawerEmailWorldID = ({ open, setOpen, handleCancel, handleSubmit, isLoading, email, setEmail }: {open: boolean, setOpen: (open: boolean) => void, handleCancel: () => void, handleSubmit: (e: React.FormEvent) => void, isLoading: boolean, email: string, setEmail: (email: string) => void}) => {
  const [isValidEmail, setIsValidEmail] = useState(false)

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent className="mx-4 pb-4 rounded-t-3xl overflow-hidden">
        <DrawerHeader className="text-left pb-4 px-6 bg-white pt-6">
          <div className="flex justify-between">
            <div>
              <Image
                src="https://cdn.prod.website-files.com/65b2cb5abdecf7cd7747e170/66b1dc2e893d609f5e3d5efa_ec_lockup_wht.svg"
                alt="EdgeCity Logo"
                width={70}
                height={40}
                priority
                style={{ filter: 'brightness(0) saturate(100%)' }}
              />
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8 rounded-full bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div>
            <DrawerTitle className="text-lg font-semibold">Enter your email</DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground mt-1">
              Please enter your email to continue
            </DrawerDescription>
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
                placeholder="john@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setIsValidEmail(validateEmail(e.target.value))
                }}
                className="w-full py-5 text-md"
                required
              />
            </div>
          </form>
          <div className="flex justify-end w-full my-4 mt-6">
            <Button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 bg-black hover:bg-black/90 text-white rounded-full"
              disabled={isLoading || !isValidEmail}
            >
              {isLoading ? "Confirming..." : "Confirm"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
export default DrawerEmailWorldID