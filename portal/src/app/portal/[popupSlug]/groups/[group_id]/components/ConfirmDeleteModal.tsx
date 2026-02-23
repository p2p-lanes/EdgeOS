import type { GroupMemberPublic } from "@edgeos/api-client"
import { GroupsService } from "@edgeos/api-client"
import { useParams } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import Modal from "@/components/ui/modal"

interface ConfirmDeleteModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  member: GroupMemberPublic
}

const ConfirmDeleteModal = ({
  open,
  onClose,
  onSuccess,
  member,
}: ConfirmDeleteModalProps) => {
  const { group_id } = useParams() as { group_id: string }
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await GroupsService.removeGroupMember({
        groupId: group_id,
        humanId: member.id,
      })
      toast.success("Member deleted successfully")

      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    } catch (error: any) {
      console.error("Error deleting member:", error)
      toast.error(error.response?.data?.message || "Failed to delete member")
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
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmDeleteModal
