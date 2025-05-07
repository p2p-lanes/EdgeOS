"use client"

import { useState, useEffect } from "react"
import { ButtonAnimated } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AttendeeCategory, AttendeeProps } from "@/types/Attendee"
import Modal from "@/components/ui/modal"
import { DialogFooter } from "@/components/ui/dialog"
import { badgeName } from "../constants/multiuse"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"

interface AttendeeModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AttendeeProps) => Promise<void>
  category: AttendeeCategory
  editingAttendee: AttendeeProps | null,
  isDelete?: boolean
}

const defaultFormData = {
  name: "",
  email: "",
  gender: "",
}

type FormDataProps = {
  name: string
  email: string
  category?: string
  gender?: string
}

const kidsAgeOptions = [{label: 'Baby (<2)', value: 'baby'}, {label: 'Kid (2-12)', value: 'kid'}, {label: 'Teen (13-18)', value: 'teen'}]

export function AttendeeModal({ onSubmit, open, onClose, category, editingAttendee, isDelete }: AttendeeModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormDataProps>(defaultFormData)

  useEffect(() => {
    if (editingAttendee) {
      const {name, email, category, gender} = editingAttendee
      setFormData({ name, email, category, gender })
    } else {
      setFormData(defaultFormData)
    }
  }, [editingAttendee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({...formData, category: formData.category ?? category, id: editingAttendee?.id, gender: formData.gender ?? editingAttendee?.gender } as AttendeeProps)
    } finally {
      setLoading(false)
    }
  }

  const isChildCategory = category === 'kid' || (formData.category && ['baby', 'kid', 'teen'].includes(formData.category))
  const title = editingAttendee ? `Edit ${editingAttendee.name}` : `Add ${isChildCategory ? 'child' : badgeName[category]}`
  const description = `Enter the details of your ${category} here. Click save when you're done.`

  if(isDelete) {
    return (
      <Modal open={open} onClose={onClose} title={`Delete ${editingAttendee?.name}`} description={`Are you sure you want to delete this ${category}?`}>
        <DialogFooter>
          <ButtonAnimated className="bg-red-500" loading={loading} onClick={handleSubmit}>
            Delete
          </ButtonAnimated>
        </DialogFooter>
      </Modal>
    )
  }
  
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      {isChildCategory && (
        <div className="-mt-4 text-sm text-gray-500">
          <Link href="https://edgeesmeralda2025.substack.com/p/kids-and-families-at-edge-esmeralda" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Learn more about children tickets
          </Link>.
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              className="col-span-3"
              required
            />
          </div>
          {
            isChildCategory && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="age" className="text-right">
                  Age <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  required
                  onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    {kidsAgeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          }
          {
            category === 'spouse' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email <span className="text-red-500">*</span>
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
            )
          }
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">
              Gender <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData(prev => ({...prev, gender: value}))}
              required
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="prefer not to say">Prefer not to say</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {
            category !== 'spouse' && category !== 'main' && (
              <p className="text-sm text-gray-500">Please note: Parents are asked to contribute at least 4 hours/week, with those of kids under 7 volunteering one full day (or two half days). Scheduling is flexible.</p>
            ) 
          }
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

