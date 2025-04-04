
import { Member } from '../types'
import MemberItem from './MemberItem'

interface MembersListProps {
  members: Member[]
}

const MembersList = ({ members }: MembersListProps) => {
  if (members.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No members found. Try a different search term or add a new member.
      </div>
    )
  }

  console.log(members)

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <MemberItem key={member.id} member={member} />
      ))}
    </div>
  )
}

export default MembersList 