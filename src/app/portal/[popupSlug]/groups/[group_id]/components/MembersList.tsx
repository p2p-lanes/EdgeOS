import { Member } from '@/types/Group'
import MemberItem from './MemberItem'

interface MembersListProps {
  members: Member[]
  onMemberUpdated?: () => void
}

const MembersList = ({ members, onMemberUpdated }: MembersListProps) => {
  if (members.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No members found. Try a different search term or add a new member.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <MemberItem 
          key={member.id} 
          member={member} 
          onMemberUpdated={onMemberUpdated}
        />
      ))}
    </div>
  )
}

export default MembersList 