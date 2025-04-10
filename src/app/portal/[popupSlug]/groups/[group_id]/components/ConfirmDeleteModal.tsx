import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { api } from '@/api'
import { toast } from 'sonner'
import Modal from '@/components/ui/modal'
import { Member } from '@/types/Group'

interface ConfirmDeleteModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  member: Member
}

const ConfirmDeleteModal = ({ open, onClose, onSuccess, member }: ConfirmDeleteModalProps) => {
  const { group_id } = useParams() as { group_id: string }
  const [isDeleting, setIsDeleting] = useState(false)
  
  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      await api.delete(`/groups/${group_id}/members/${member.id}`)
      toast.success('Member deleted successfully')
      
      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    } catch (error: any) {
      console.error('Error deleting member:', error)
      toast.error(error.response?.data?.message || 'Failed to delete member')
    } finally {
      setIsDeleting(false)
    }
  }
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete Member"
      description={`Are you sure you want to delete ${member.first_name} ${member.last_name} from the group?`}
    >
      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button 
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmDeleteModal 