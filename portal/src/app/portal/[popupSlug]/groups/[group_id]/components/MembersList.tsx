import type { GroupMemberPublic } from "@edgeos/api-client"
import MemberItem from "./MemberItem"

interface MembersListProps {
  members: GroupMemberPublic[]
  onMemberUpdated?: () => void
  isAmbassadorGroup?: boolean
}

const MembersList = ({
  members,
  onMemberUpdated,
  isAmbassadorGroup,
}: MembersListProps) => {
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
          isAmbassadorGroup={isAmbassadorGroup}
        />
      ))}
    </div>
  )
}

export default MembersList
