import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-3xl overflow-hidden mb-1 max-w-[96vw] bg-white p-0 py-2" hasCloseButton={false}>
        <DialogHeader className="text-left pb-4 px-6 bg-white pt-6">
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
            <DialogTitle className="text-lg font-semibold">Enter your email</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1">
              Please enter your email to continue
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="px-6 bg-white flex flex-col justify-between h-full mb-2">
          <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setIsValidEmail(validateEmail(e.target.value))
                }}
                className="w-full py-5 text-md"
                required
              />
            </div>
            <div className="flex justify-end w-full my-4 mt-2">
              <Button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 bg-black hover:bg-black/90 text-white rounded-full"
                disabled={isLoading || !isValidEmail}
              >
                {isLoading ? "Confirming..." : "Confirm"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
export default DrawerEmailWorldID