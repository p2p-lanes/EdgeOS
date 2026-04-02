"use client"

import { useState, useEffect } from "react"
import { ButtonAnimated } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AttendeeCategory, AttendeeProps } from "@/types/Attendee"
import Modal from "@/components/ui/modal"
import { DialogFooter } from "@/components/ui/dialog"
import { badgeName } from "@/components/utils/multiuse"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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


const ageOptions = ["< 1", ...Array.from({ length: 18 }, (_, i) => (i + 1).toString())];

const ageToCategory = (age: string): AttendeeCategory => {
  if (age === "< 1" || age === "1" || age === "2") return "baby"
  const num = parseInt(age)
  if (num >= 3 && num <= 6) return "younger kid"
  if (num >= 7 && num <= 12) return "kid"
  return "teen"
}

export function AttendeeModal({ onSubmit, open, onClose, category, editingAttendee, isDelete }: AttendeeModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormDataProps>(defaultFormData)
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (editingAttendee) {
      const {name, email, category, gender} = editingAttendee
      setFormData({ name, email, category, gender })
    } else {
      setFormData(defaultFormData)
    }
    setErrors({})
  }, [editingAttendee, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    const newErrors: {[key: string]: boolean} = {}
    
    if (!formData.name.trim()) {
      newErrors.name = true
    }
    
    if (category !== 'nanny' && !formData.gender) {
      newErrors.gender = true
    }
    
    if (isChildCategory && !formData.category) {
      newErrors.category = true
    }
    
    if ((category === 'spouse' || category === 'nanny') && !formData.email.trim()) {
      newErrors.email = true
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    setErrors({})
    setLoading(true)
    try {
      const resolvedCategory = isChildCategory && formData.category
        ? ageToCategory(formData.category)
        : (formData.category ?? category) as AttendeeCategory
      await onSubmit({...formData, category: resolvedCategory, id: editingAttendee?.id, gender: formData.gender } as AttendeeProps)
    } finally {
      setLoading(false)
    }
  }

  const isChildCategory = category === 'kid' || (formData.category && ['baby', 'younger kid', 'kid', 'teen'].includes(formData.category))
  const title = editingAttendee ? `Edit ${editingAttendee.name}` : `Add ${isChildCategory ? 'child' : badgeName[category]}`
  const categoryLabel = category === 'nanny' ? 'Caregiver/Nanny' : category
  const description = `Enter the details of your ${categoryLabel} here. Click save when you're done.`

  if(isDelete) {
    return (
      <Modal open={open} onClose={onClose} title={`Delete ${editingAttendee?.name}`} description={`Are you sure you want to delete this ${category}?`}>
        <DialogFooter>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white" 
            disabled={loading} 
            onClick={handleSubmit}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </Modal>
    )
  }
  
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      {/* {isChildCategory && (
        <div className="-mt-4 text-sm text-gray-500">
          <Link href="https://edgeesmeralda2025.substack.com/p/kids-and-families-at-edge-esmeralda" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Learn more about children tickets
          </Link>.
        </div>
      )} */}
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
              className={`col-span-3 ${errors.name ? 'border-red-500' : ''}`}
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
                  <SelectTrigger className={`col-span-3 ${errors.category ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-[200px] overflow-y-auto">
                    {ageOptions.map((age) => (
                      <SelectItem key={age} value={age}>
                        {age === "< 1" ? "< 1 year old" : `${age} years old`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          }
          {
            (category === 'spouse' || category === 'nanny') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                  className={`col-span-3 ${errors.email ? 'border-red-500' : ''}`}
                  required
                />
              </div>
            )
          }
          {category !== 'nanny' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData(prev => ({...prev, gender: value}))}
                required
              >
                <SelectTrigger className={`col-span-3 ${errors.gender ? 'border-red-500' : ''}`}>
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
          )}

          {/* {
            category !== 'spouse' && category !== 'main' && (
              <p className="text-sm text-gray-500">Please note: Parents are asked to contribute at least 4 hours/week, with those of kids under 7 volunteering one full day (or two half days). Scheduling is flexible.</p>
            ) 
          } */}
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

