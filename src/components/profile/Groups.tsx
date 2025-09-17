import { Card } from "../ui/card"
import useGetGroups from "../Sidebar/hooks/useGetGroups"
import { Button } from "../ui/button"
import { Check, Copy, SquareArrowOutUpRight, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { getBaseUrl } from "@/utils/environment"
import { useState } from "react"
import { useCityProvider } from "@/providers/cityProvider"
import { toast } from "sonner"
import { GroupProps } from "@/types/Group"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Badge } from "../ui/badge"
import { PopupsProps } from "@/types/Popup"

// Function to get checkout link for a specific group
const getCheckoutLinkForGroup = (group: GroupProps, popups: PopupsProps[]): string | null => {
  const baseUrl = getBaseUrl()
  
  // Find the popup/city for this group
  const groupPopup = popups.find((popup: PopupsProps) => popup.id === group.popup_city_id)
  
  if (!groupPopup) return null
  
  if (group.is_ambassador_group) {
    return `${baseUrl}/${groupPopup.slug}/invite/${group.slug}`
  } else {
    return `${baseUrl}/checkout?group=${group.slug}`
  }
}

const Groups = () => {
  const { groups } = useGetGroups()
  const router = useRouter()
  const { getCity, getPopups } = useCityProvider()
  const popups = getPopups()

  if(groups.length === 0) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Groups</h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group, index) => {
            const groupPopup = popups.find((popup: PopupsProps) => popup.id === group.popup_city_id)
            const isPopupActive = groupPopup?.clickable_in_portal ?? false

            return (
              <Card key={`group-${index}`} className={`p-4 hover:shadow-md transition-shadow ${isPopupActive ? 'cursor-pointer' : ''}`} onClick={isPopupActive ? () => router.push(`/portal/${groupPopup?.slug}/groups/${group.id}`) : undefined}>
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-600 font-medium">{group.popup_name}</p>
                  <Badge variant={'outline'} className="w-fit mt-1">{group.is_ambassador_group ? 'Ambassador' : 'Group'}</Badge>
                </div>
                <ButtonCopyLink group={group} popups={popups} isPopupActive={isPopupActive}/>
              </div>
            </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const ButtonCopyLink = ({ group, popups, isPopupActive }: { group: GroupProps, popups: PopupsProps[], isPopupActive: boolean }) => {
  const [isCopied, setIsCopied] = useState(false)

  // Don't render button if popup is not active
  if (!isPopupActive) return null

  const handleCopyCheckoutLink = async (group: GroupProps) => {
    const checkoutLink = getCheckoutLinkForGroup(group, popups)
    
    if (!checkoutLink) {
      toast.error('No se pudo generar el link para este grupo')
      return
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

  return (
     <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleCopyCheckoutLink(group)
            }}
          >
            {isCopied ? (
                <>
                  <Check className="w-3 h-3" />
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                </>
            )}
          </Button>

        </TooltipTrigger>
        <TooltipContent>
          {group.is_ambassador_group ? 'Copy Referral Link' : 'Copy Express Checkout Link'}
        </TooltipContent>
      </Tooltip>
  )
}

export default Groups