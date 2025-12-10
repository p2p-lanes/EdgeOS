"use client"

import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import useGetGroups from "../Sidebar/hooks/useGetGroups"
import { GroupProps } from "@/types/Group"
import { PopupsProps } from "@/types/Popup"
import { useCityProvider } from "@/providers/cityProvider"
import { getBaseUrl } from "@/utils/environment"
import { useState } from "react"
import { Card } from "../ui/card"

export default function ReferralLinks({ referralCount }: { referralCount: number }) {
  const { groups } = useGetGroups()
  const { getPopups } = useCityProvider()
  const popups = getPopups()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const activeGroups = groups.filter((group: GroupProps) => {
    const groupPopup = popups.find((popup: PopupsProps) => popup.id === group.popup_city_id)
    const isPopupActive = groupPopup?.clickable_in_portal ?? false
    return isPopupActive && groupPopup && group.is_ambassador_group
  })

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col gap-1 items-start justify-center">
          <h3 className="text-lg font-semibold text-[#020817]">Referral Links</h3>
          <p className="text-sm text-[#64748b]">
            Give your friends an auto-approval for upcoming EdgeCity events
          </p>
        </div>
        <div className="text-right flex gap-2 items-end">
          <p className="text-xs text-[#64748b] mb-1">Total referrals</p>
          <p className="text-2xl font-bold text-[#020817]">{referralCount}</p>
        </div>
      </div>

      <div className="bg-[#f8fafc] rounded-lg p-4 space-y-3">
        {activeGroups.length === 0 ? (
          <div className="flex items-center justify-center p-4">
            <p className="text-sm text-[#64748b] text-center">
              You don’t have referral links for future pop-ups. Buy a ticket and get your referral link.
            </p>
          </div>
        ) : (
          activeGroups.map((group: GroupProps) => {
            const groupPopup = popups.find((popup: PopupsProps) => popup.id === group.popup_city_id)
            
            if (!groupPopup) return null

            const baseUrl = getBaseUrl()
            const link = `${baseUrl}/${groupPopup.slug}/invite/${group.slug}`

            return (
              <div key={group.id} className="flex items-center gap-4">
                <div className="w-40 flex-shrink-0">
                  <p className="text-sm text-[#020817]">{group.popup_name}</p>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={link}
                    disabled
                    className="w-full px-3 py-2 pr-10 text-sm text-[#64748b] bg-[#ffffff] border border-[#e2e8f0] rounded-md cursor-default"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(link, group.id)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-[#f1f5f9]"
                  >
                    {copiedId === group.id ? (
                      <Check className="w-4 h-4 text-[#64748b]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#64748b]" />
                    )}
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
