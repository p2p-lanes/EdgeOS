"use client"

import { useState, useEffect } from "react"
import { ButtonAnimated } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AttendeeCategory, AttendeeProps } from "@/types/Attendee"
import Modal from "@/components/ui/modal"
import { DialogFooter } from "@/components/ui/dialog"

interface AttendeeModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AttendeeProps) => Promise<void>
  category: AttendeeCategory
  editingAttendee: AttendeeProps | null
}

const defaultFormData = {
  name: "",
  email: "",
}

export function AttendeeModal({ onSubmit, open, onClose, category, editingAttendee }: AttendeeModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(defaultFormData)

  useEffect(() => {
    if (editingAttendee) {
      const {name, email} = editingAttendee
      setFormData({ name, email })
    } else {
      setFormData(defaultFormData)
    }
  }, [editingAttendee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSubmit({...formData, category, id: editingAttendee?.id} as AttendeeProps)
    } finally {
      setLoading(false)
    }
  }

  const title = editingAttendee ? `Edit ${category}` : `Add ${category}`
  const description = `Enter the details of your ${category} here. Click save when you're done.`
  
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Full Name
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
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
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              className="col-span-3"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <ButtonAnimated loading={loading} type="submit">
            {editingAttendee ? 'Update' : 'Save'}
          </ButtonAnimated>
        </DialogFooter>
      </form>
    </Modal>
  )
}

