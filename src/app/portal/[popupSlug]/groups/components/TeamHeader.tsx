import { Button } from '@/components/ui/button'
import { Link } from 'lucide-react'

const TeamHeader = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Muvi Team</h1>
        <p className="text-gray-500 text-sm">
          View and manage your groups here. Need to make changes? You can click on a group and edit
          or delete its members.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button 
          className="inline-flex items-center gap-2"
          variant="outline"
        >
          <span className="text-lg font-normal">+</span> Add a new member
        </Button>
        
        <Button 
          className="inline-flex items-center gap-2" 
        >
          <Link className="w-4 h-4" /> Share Express Checkout link
        </Button>
      </div>
    </div>
  )
}

export default TeamHeader 