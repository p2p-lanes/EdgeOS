"use client"

import type { GroupPublic, PopupPublic } from "@edgeos/api-client"
import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCityProvider } from "@/providers/cityProvider"
import { getBaseUrl } from "@/utils/environment"
import useGetGroups from "../Sidebar/hooks/useGetGroups"
import { Card } from "../ui/card"

export default function ReferralLinks({
  referralCount,
}: {
  referralCount: number
}) {
  const { data: groups = [] } = useGetGroups()
  const { getPopups } = useCityProvider()
  const popups = getPopups()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const activeGroups = groups.filter((group: GroupPublic) => {
    const groupPopup = popups.find(
      (popup: PopupPublic) => popup.id === group.popup_id,
    )
    return (
      groupPopup?.status === "active" && groupPopup && group.is_ambassador_group
    )
  })

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  return (
    <Card className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex flex-col gap-1 items-start justify-center">
          <h3 className="text-lg font-semibold text-[#020817]">
            Referral Links
          </h3>
          <p className="text-sm text-[#64748b]">
            Give your friends an auto-approval for upcoming EdgeCity events
          </p>
        </div>
        <div className="flex gap-2 items-center mt-4 md:mt-0 md:items-end">
          <p className="text-xs text-[#64748b] mb-1">Total referrals</p>
          <p className="text-2xl font-bold text-[#020817]">{referralCount}</p>
        </div>
      </div>

      <div className="bg-[#f8fafc] rounded-lg p-3 md:p-4 space-y-3">
        {activeGroups.length === 0 ? (
          <div className="flex items-center justify-center p-4">
            <p className="text-sm text-[#64748b] text-center">
              You don’t have referral links for future pop-ups. Buy a ticket and
              get your referral link.
            </p>
          </div>
        ) : (
          activeGroups.map((group: GroupPublic) => {
            const groupPopup = popups.find(
              (popup: PopupPublic) => popup.id === group.popup_id,
            )

            if (!groupPopup) return null

            const baseUrl = getBaseUrl()
            const link = `${baseUrl}/${groupPopup.slug}/invite/${group.slug}`

            return (
              <div
                key={group.id}
                className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4"
              >
                <div className="w-full md:w-40 flex-shrink-0">
                  {/* LEGACY: popup_name removed from API – review for deletion */}
                  <p className="text-sm text-[#020817] font-medium md:font-normal">
                    {groupPopup?.name}
                  </p>
                </div>
                <div className="flex-1 relative w-full">
                  <input
                    type="text"
                    value={link}
                    disabled
                    className="w-full px-3 py-2 pr-10 text-sm text-[#64748b] bg-[#ffffff] border border-[#e2e8f0] rounded-md cursor-default truncate"
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
