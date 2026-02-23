"use client"

import { useEffect, useState } from "react"
import { Button, ButtonAnimated } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Modal from "@/components/ui/modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AttendeeCategory, AttendeePassState } from "@/types/Attendee"
import { badgeName } from "../constants/multiuse"

interface AttendeeModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AttendeePassState) => Promise<void>
  category: AttendeeCategory
  editingAttendee: AttendeePassState | null
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

const kidsAgeOptions = [
  { label: "Baby (<2)", value: "baby" },
  { label: "Kid (2-12)", value: "kid" },
  { label: "Teen (13-18)", value: "teen" },
]

export function AttendeeModal({
  onSubmit,
  open,
  onClose,
  category,
  editingAttendee,
  isDelete,
}: AttendeeModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<FormDataProps>(defaultFormData)
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (editingAttendee) {
      setFormData({
        name: editingAttendee.name,
        email: editingAttendee.email ?? "",
        category: editingAttendee.category,
        gender: editingAttendee.gender ?? "",
      })
    } else {
      setFormData(defaultFormData)
    }
    setErrors({})
  }, [editingAttendee])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    const newErrors: { [key: string]: boolean } = {}

    if (!formData.name.trim()) {
      newErrors.name = true
    }

    if (!formData.gender) {
      newErrors.gender = true
    }

    if (isChildCategory && !formData.category) {
      newErrors.category = true
    }

    if (category === "spouse" && !formData.email.trim()) {
      newErrors.email = true
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        category: formData.category ?? category,
        id: editingAttendee?.id ?? "",
        gender: formData.gender,
      } as AttendeePassState)
    } finally {
      setLoading(false)
    }
  }

  const isChildCategory =
    category === "kid" ||
    (formData.category && ["baby", "kid", "teen"].includes(formData.category))
  const title = editingAttendee
    ? `Edit ${editingAttendee.name}`
    : `Add ${isChildCategory ? "child" : badgeName[category]}`
  const description = `Enter the details of your ${category} here. Click save when you're done.`

  if (isDelete) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={`Delete ${editingAttendee?.name}`}
        description={`Are you sure you want to delete this ${category}?`}
      >
        <DialogFooter>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
    >
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={`col-span-3 ${errors.name ? "border-red-500" : ""}`}
              required
            />
          </div>
          {isChildCategory && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">
                Age <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                required
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger
                  className={`col-span-3 ${errors.category ? "border-red-500" : ""}`}
                >
                  <SelectValue placeholder="Select age" />
                </SelectTrigger>
                <SelectContent>
                  {kidsAgeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {category === "spouse" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className={`col-span-3 ${errors.email ? "border-red-500" : ""}`}
                required
              />
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="gender" className="text-right">
              Gender <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, gender: value }))
              }
              required
            >
              <SelectTrigger
                className={`col-span-3 ${errors.gender ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="prefer not to say">
                  Prefer not to say
                </SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* {
            category !== 'spouse' && category !== 'main' && (
              <p className="text-sm text-gray-500">Please note: Parents are asked to contribute at least 4 hours/week, with those of kids under 7 volunteering one full day (or two half days). Scheduling is flexible.</p>
            ) 
          } */}
        </div>
        <DialogFooter>
          <ButtonAnimated loading={loading} type="submit">
            {editingAttendee ? "Update" : "Save"}
          </ButtonAnimated>
        </DialogFooter>
      </form>
    </Modal>
  )
}
