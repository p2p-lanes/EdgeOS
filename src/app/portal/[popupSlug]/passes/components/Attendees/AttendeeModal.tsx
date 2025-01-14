"use client"

import { useState, useEffect } from "react"
import { ButtonAnimated } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AttendeeModalProps {
  onAddAttendee: (attendee: any) => void
  open: boolean
  setOpen: (open: boolean) => void
  initialName: string
  initialEmail: string
  isEdit: boolean
}

export function AttendeeModal({ onAddAttendee, open, setOpen, initialName, initialEmail, isEdit }: AttendeeModalProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)

  useEffect(() => {
    setName(initialName)
    setEmail(initialEmail)
  }, [initialName, initialEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onAddAttendee({ name, email, category: 'spouse' })
    setName("")
    setEmail("")
    setOpen(false)
    setLoading(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Spouse' : 'Add Spouse'}</DialogTitle>
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

