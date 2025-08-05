import { useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import Modal from '@/components/ui/modal'
import TextAreaForm from '@/components/ui/Form/TextArea'
import { Button } from '@/components/ui/button'
import { api } from '@/api'
import { GroupProps } from '@/types/Group'

interface WelcomeMessageModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  group: GroupProps
}

const WelcomeMessageModal = ({ open, onClose, onSuccess, group }: WelcomeMessageModalProps) => {
  const { group_id } = useParams() as { group_id: string }
  const [welcomeMessage, setWelcomeMessage] = useState(group.welcome_message || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => {
    setWelcomeMessage(group.welcome_message || '')
    setError('')
    onClose()
  }

  const validateMessage = () => {
    if (!welcomeMessage.trim()) {
      setError('Welcome message is required')
      return false
    }
    if (welcomeMessage.trim().length > 500) {
      setError('Welcome message must be less than 500 characters')
      return false
    }
    setError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateMessage()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await api.put(`/groups/${group_id}`, {
        welcome_message: welcomeMessage.trim()
      })
      
      if (response.status === 200) {
        toast.success('Welcome message updated successfully')
        if (onSuccess) {
          onSuccess()
        } else {
          onClose()
        }
      } else {
        toast.error('Failed to update welcome message')
      }
    } catch (error: any) {
      console.error('Error updating welcome message:', error)
      toast.error(error.response?.data?.message || 'Failed to update welcome message')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit Welcome Message"
      description="Customize the welcome message that users will see when they access the shared express checkout link"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextAreaForm
          id="welcome-message"
          label="Welcome Message"
          value={welcomeMessage}
          handleChange={setWelcomeMessage}
          error={error}
          isRequired={true}
          subtitle={`${welcomeMessage.length}/500 characters`}
          placeholder="Enter a welcome message that will be shown to users when they access your shared express checkout link..."
        />
        
        <div className="flex gap-3 justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Message'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default WelcomeMessageModal