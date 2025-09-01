import { Button } from '@/components/ui/button'
import { Check, Edit, Import, Plus, Share2, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { getBaseUrl } from '@/utils/environment'
import { GroupProps } from '@/types/Group'
import MemberFormModal from './AddMemberModal'
import ImportMembersModal from './ImportMembersModal'
import WelcomeMessageModal from './WelcomeMessageModal'
import { useParams } from 'next/navigation'
import { useApplication } from '@/providers/applicationProvider'
import { useCityProvider } from '@/providers/cityProvider'

interface TeamHeaderProps {
  totalMembers: number
  group: GroupProps
  onMemberAdded?: () => void
  onGroupUpdated?: () => void
}

const TeamHeader = ({ totalMembers, group, onMemberAdded, onGroupUpdated }: TeamHeaderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isWelcomeMessageModalOpen, setIsWelcomeMessageModalOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const {getCity} = useCityProvider()

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

  const handleWelcomeMessageModalClose = () => {
    setIsWelcomeMessageModalOpen(false)
  }

  const handleWelcomeMessageUpdated = () => {
    if (onGroupUpdated) {
      onGroupUpdated()
    }
    handleWelcomeMessageModalClose()
  }

  const handleCopyCheckoutLink = async () => {
    const baseUrl = getBaseUrl()
    let checkoutLink = ''
    if(group.is_ambassador_group){
      const city = getCity()
      checkoutLink = `${baseUrl}/${city?.slug}/invite/${group.slug}`
    }
    else{
      checkoutLink = `${baseUrl}/checkout?group=${group.slug}`
    }
    
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

  const isAmbassadorGroup = group.is_ambassador_group

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
          <Users size={16} className="mr-2" />
          <p className="text-sm text-gray-500">{totalMembers}{group.max_members ? `/${group.max_members}` : ''} members</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          {
            !isAmbassadorGroup && (
              <>
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
              </>
            )
          }
          
          <Button
            onClick={handleCopyCheckoutLink}
            
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4" /> Share Express Checkout link
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" /> Share Express Checkout link
              </>
            )}
          </Button>

          {/* {isAmbassadorGroup && (
            <Button
              variant="outline"
              className="bg-white"
              onClick={() => setIsWelcomeMessageModalOpen(true)}
            >
              <Edit className="w-4 h-4" /> Edit Welcome Message
            </Button>
          )} */}
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

      <WelcomeMessageModal
        open={isWelcomeMessageModalOpen}
        onClose={handleWelcomeMessageModalClose}
        onSuccess={handleWelcomeMessageUpdated}
        group={group}
      />
      
    </div>
  )
}

export default TeamHeader 