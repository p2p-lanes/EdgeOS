import { Button } from '@/components/ui/button'
import { Check, Copy, Import, Plus, Share2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { getBaseUrl } from '@/utils/environment'
import { GroupProps } from '@/types/Group'
import MemberFormModal from './AddMemberModal'
import ImportMembersModal from './ImportMembersModal'

interface TeamHeaderProps {
  totalMembers: number
  group: GroupProps
  onMemberAdded?: () => void
}

const TeamHeader = ({ totalMembers, group, onMemberAdded }: TeamHeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleImportModalClose = () => {
    setIsImportModalOpen(false)
  }

  const handleMemberAdded = () => {
    if (onMemberAdded) {
      onMemberAdded()
    }
    handleModalClose()
  }

  const handleMembersImported = () => {
    if (onMemberAdded) {
      onMemberAdded()
    }
    handleImportModalClose()
  }

  const handleCopyCheckoutLink = async () => {
    const baseUrl = getBaseUrl()
    const checkoutLink = `${baseUrl}/checkout?group=${group.slug}`
    
    try {
      await navigator.clipboard.writeText(checkoutLink)
      setIsCopied(true)
      toast.success('Express Checkout link copied to clipboard!')
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy link to clipboard')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{group.name}</h1>
        <p className="text-gray-500 text-sm">
          View and manage your group members here. Need to make changes? You can click on a member and edit
          or remove them from the group.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-between">

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{totalMembers}/20 members</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button 
            variant="outline" 
            className="bg-white"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Import className="w-4 h-4" /> Import
          </Button>

          <Button 
            variant="outline" 
            className="bg-white"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add a new member
          </Button>
          
          <Button
            onClick={handleCopyCheckoutLink}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4" /> Copied
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" /> Share Express Checkout link
              </>
            )}
          </Button>
        </div>

      </div>

      <MemberFormModal
        open={isModalOpen} 
        onClose={handleModalClose}
        onSuccess={handleMemberAdded}
      />
      
      <ImportMembersModal
        open={isImportModalOpen}
        onClose={handleImportModalClose}
        onSuccess={handleMembersImported}
      />
      
    </div>
  )
}

export default TeamHeader 