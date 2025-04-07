import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormInputWrapper } from '@/components/ui/form-input-wrapper'
import { LabelRequired } from '@/components/ui/label'
import { api } from '@/api'
import { toast } from 'sonner'
import Modal from '@/components/ui/modal'
import { Member } from '@/types/Group'

interface MemberFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  member?: Member // Miembro existente para edición (opcional)
}

interface FormData {
  first_name: string
  last_name: string
  email: string
  telegram: string | null
  organization: string | null
  role: string | null
  gender: string | null
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  { value: 'other', label: 'Other' }
]

const MemberFormModal = ({ open, onClose, onSuccess, member }: MemberFormModalProps) => {
  const { group_id } = useParams() as { group_id: string }
  const isEditMode = !!member
  
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    telegram: null,
    organization: null,
    role: null,
    gender: null
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Cargar datos del miembro si estamos en modo edición
  useEffect(() => {
    if (member) {
      setFormData({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        telegram: member.telegram || '',
        organization: member.organization || '',
        role: member.role || '',
        gender: member.gender || ''
      })
    }
  }, [member])
  
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
    
    // Clear error when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      })
    }
  }
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    // Validate required fields
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Convertir campos vacíos a null
      const processedData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key as keyof FormData] = typeof value === 'string' && value.trim().length === 0 
          ? null 
          : value;
        return acc;
      }, {} as FormData);
      
      if (isEditMode && member) {
        // Editar miembro existente (PUT request)
        await api.put(`/groups/${group_id}/members/${member.id}`, processedData).then((res) => {
          if (res.status === 200) {
            toast.success('Member updated successfully')
          } else {
            toast.error('Failed to update member')
          }
        })
      } else {
        // Añadir nuevo miembro (POST request)
        await api.post(`/groups/${group_id}/new_member`, processedData).then((res) => {
          if (res.status === 200) {
            toast.success('Member added successfully')
          } else {
            toast.error('Failed to add member')
          }
        })
      }
      
      // Reset form
      if (!isEditMode) {
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          telegram: null,
          organization: null,
          role: null,
          gender: null
        })
      }
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} member:`, error)
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} member`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditMode ? "Edit Member" : "Add New Member"}
      description={isEditMode 
        ? "Update the member information below." 
        : "Fill in the details to add a new member to your group."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <FormInputWrapper>
            <LabelRequired htmlFor="first_name" isRequired={true}>First Name</LabelRequired>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              error={errors.first_name}
            />
            {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
          </FormInputWrapper>

          {/* Last Name */}
          <FormInputWrapper>
            <LabelRequired htmlFor="last_name" isRequired={true}>Last Name</LabelRequired>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              error={errors.last_name}
            />
            {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
          </FormInputWrapper>
        </div>

        {/* Email */}
        <FormInputWrapper>
          <LabelRequired htmlFor="email" isRequired={true}>Email</LabelRequired>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            disabled={isEditMode}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </FormInputWrapper>

        {/* Telegram */}
        <FormInputWrapper>
          <LabelRequired htmlFor="telegram" isRequired={false}>Telegram</LabelRequired>
          <Input
            id="telegram"
            value={formData.telegram || ''}
            onChange={(e) => handleInputChange('telegram', e.target.value)}
          />
        </FormInputWrapper>

        {/* Organization */}
        <FormInputWrapper>
          <LabelRequired htmlFor="organization" isRequired={false}>Organization</LabelRequired>
          <Input
            id="organization"
            value={formData.organization || ''}
            onChange={(e) => handleInputChange('organization', e.target.value)}
          />
        </FormInputWrapper>

        {/* Role */}
        <FormInputWrapper>
          <LabelRequired htmlFor="role" isRequired={false}>Role</LabelRequired>
          <Input
            id="role"
            value={formData.role || ''}
            onChange={(e) => handleInputChange('role', e.target.value)}
          />
        </FormInputWrapper>

        {/* Gender */}
        <FormInputWrapper>
          <LabelRequired htmlFor="gender" isRequired={false}>Gender</LabelRequired>
          <Select
            value={formData.gender || ''}
            onValueChange={(value) => handleInputChange('gender', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormInputWrapper>

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Member' : 'Add Member')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default MemberFormModal 