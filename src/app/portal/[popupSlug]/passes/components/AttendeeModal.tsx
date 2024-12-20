"use client"

import { useState } from "react"
import { Button, ButtonAnimated } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import usePostData from "../hooks/usePostData"

interface AttendeeModalProps {
  onAddAttendee: (attendee: any) => void
  open: boolean
  setOpen: (open: boolean) => void
  initialName: string
  initialEmail: string
}

export function AttendeeModal({ onAddAttendee, open, setOpen, initialName, initialEmail }: AttendeeModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onAddAttendee({ name, email, category: 'spouse' })
    setName("")
    setEmail("")
    setOpen(false)
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Spouse</DialogTitle>
          <DialogDescription>
            Enter the details of your spouse here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <ButtonAnimated loading={loading} type="submit">Save changes</ButtonAnimated>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

