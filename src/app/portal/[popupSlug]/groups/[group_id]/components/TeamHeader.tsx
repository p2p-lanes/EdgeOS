import { Button } from '@/components/ui/button'
import { Plus, Share2 } from 'lucide-react'

interface TeamHeaderProps {
  totalMembers: number
  groupName: string
}

const TeamHeader = ({ totalMembers, groupName }: TeamHeaderProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{groupName}</h1>
        <p className="text-gray-500 text-sm">
          View and manage your group members here. Need to make changes? You can click on a member and edit
          or remove them from the group.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 justify-between">

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{totalMembers}/20 members</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="bg-white">
            <Plus className="w-4 h-4" /> Add a new member
          </Button>
          
          <Button>
            <Share2 className="w-4 h-4" /> Share Express Checkout link
          </Button>
        </div>

      </div>
      
    </div>
  )
}

export default TeamHeader 