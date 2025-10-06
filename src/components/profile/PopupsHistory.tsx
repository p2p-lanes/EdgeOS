import { CitizenProfilePopup } from "@/types/Profile"
import { Calendar, Clock, MapPin, ExternalLink } from "lucide-react"
import Image from "next/image"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Separator } from "@radix-ui/react-select"
import useGetApplications from "@/hooks/useGetApplications"
import { useApplication } from "@/providers/applicationProvider"
import { useCityProvider } from "@/providers/cityProvider"
import { usePoapsProvider } from "@/providers/poapsProvider"
import { PoapProps } from "@/types/Poaps"

type ApplicationStatus = "draft" | "in review" | "accepted" | "rejected"

interface PopupWithApplicationStatus extends CitizenProfilePopup {
  application_status?: ApplicationStatus
}

const PopupsHistory = ({popups}: {popups: CitizenProfilePopup[]}) => {
  const { poapsWithPopup } = usePoapsProvider()
  const { applications } = useApplication()
  const { getPopups } = useCityProvider()
  const allPopups = getPopups()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  console.log(poapsWithPopup)

  const getPopupStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (now > end) {
      return { label: "Completed", className: "bg-green-100 text-green-800" }
    }
    if (now >= start && now <= end) {
      return { label: "In progress", className: "bg-blue-100 text-blue-800" }
    }
    return { label: "Upcoming", className: "bg-gray-100 text-gray-800" }
  }

  const getApplicationStatusBadge = (status?: string) => {
    switch(status) {
      case "accepted":
        return { label: "Application Approved", className: "bg-green-100 text-green-800" }
      case "in review":
        return { label: "Application Submitted", className: "bg-blue-100 text-blue-800" }
      case "draft":
        return { label: "Application Draft", className: "bg-gray-100 text-gray-800" }
      default:
        return { label: "Upcoming", className: "bg-gray-100 text-gray-800" }
    }
  }

  const getMainPoapForPopup = (popupName: string): PoapProps | null => {
    // Find the popup in poapsWithPopup by popup_name
    const poapResponse = poapsWithPopup?.find(p => p.popup_name === popupName)
    
    if (!poapResponse || !poapResponse.poaps || poapResponse.poaps.length === 0) {
      return null
    }

    // Find the first poap with attendee_category = 'main'
    const mainPoap = poapResponse.poaps.find(poap => poap.attendee_category === 'main')
    
    return mainPoap || null
  }
  
  // Filter applications where ALL attendees have NO products
  const applicationsWithoutProducts = applications?.filter(app => 
    app.attendees.every(attendee => attendee.products.length === 0)
  ) ?? []
  
  // Map applications to popup data for upcoming popups with application status
  const upcomingPopupsFromApplications = applicationsWithoutProducts
    .map(app => {
      const popup = allPopups.find(p => p.id === app.popup_city_id)
      if (!popup) return null
      
      return {
        popup_name: popup.name,
        start_date: popup.start_date,
        end_date: popup.end_date,
        total_days: 0, // This could be calculated if needed
        location: popup.location,
        image_url: popup.image_url,
        application_status: app.status // Include application status
      } as PopupWithApplicationStatus
    })
    .filter((p): p is PopupWithApplicationStatus => p !== null)
    .filter(popup => new Date(popup.end_date) > new Date()) // Only show upcoming events

  const pastPopups = popups.filter((popup) => new Date(popup.end_date) < new Date())

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Pop-Ups</h2>
        <p className="text-sm text-gray-600">Your upcoming and past Pop-Ups</p>
      </div>

      <div className="py-2">
        <div className="space-y-6">
          {popups.length === 0 && (
            <div className="text-center text-gray-600 p-4">No events found</div>
          )}
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-6 h-6 text-foreground" />
            <h4 className="text-md font-semibold text-foreground">Upcoming Pop-Ups</h4>
          </div>
          <div className="space-y-4">
            {
              upcomingPopupsFromApplications.length === 0 && (
                <div className="text-center text-gray-600 p-4">No upcoming events found</div>
              )
            }
            {upcomingPopupsFromApplications.map((popup, index) => (
              <div key={popup.popup_name} className="flex items-center gap-4 p-4 border border-[#e2e8f0] rounded-lg">
                <Image
                  src={popup.image_url || "/placeholder.svg"}
                  alt={popup.popup_name}
                  width={70}
                  height={70}
                  className="object-cover aspect-square rounded-lg"
                />
                <div className="flex-1">
                  <h5 className="text-xl font-semibold text-foreground mb-2">{popup.popup_name}</h5>
                  <div className="flex items-center gap-4 text-xs text-[#64748b]">
                    {
                      popup.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-black" />
                          <span className="text-sm">{popup.location?.charAt(0).toUpperCase() + popup.location?.slice(1)}</span>
                        </div>
                      )
                    }
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-black" />
                      <span className="text-sm">{formatDate(popup.start_date)} - {formatDate(popup.end_date)}</span>
                    </div>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded text-xs font-medium ${getApplicationStatusBadge(popup.application_status).className}`}
                >
                  {getApplicationStatusBadge(popup.application_status).label}
                </div>
              </div>
            ))}
          </div>

          <div className="h-px w-full bg-gray-200" />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-foreground" />
              <h4 className="text-md font-semibold text-foreground">Past Pop-Ups</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pastPopups.map((popup) => (
                <Card key={popup.popup_name} className="p-4">
                  <div className="relative mb-3">
                    <Image src={popup.image_url || "/placeholder.svg"} alt={popup.popup_name} width={160} height={160} className="w-full h-auto max-h-[140px] object-cover rounded-lg aspect-auto object-top" />
                    <div className="absolute top-2 left-2 bg-[#dcfce7] text-[#166534] px-2 py-1 rounded text-xs font-medium">
                      Completed
                    </div>
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-black mb-2">{popup.popup_name}</h5>
                    <div className="space-y-2 text-xs text-[#64748b] mb-4">

                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-black" />
                        <span className="text-sm">{popup.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-black" />
                        <span className="text-sm">{formatDate(popup.start_date)} - {formatDate(popup.end_date)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-black" />
                        <span className="text-sm">{popup.total_days} days attended</span>
                      </div>

                    </div>
                    {(() => {
                      const mainPoap = getMainPoapForPopup(popup.popup_name)
                      
                      if (!mainPoap) return null

                      const isClaimed = mainPoap.poap_claimed
                      const buttonText = isClaimed ? "Go to poap" : "Claim poap"

                      return (
                        <div onClick={() => window.open(mainPoap.poap_url, '_blank')} className="w-full p-2 flex justify-center items-center gap-3 bg-gray-100 rounded-sm h-[42px] hover:bg-gray-200 cursor-pointer">
                          {
                            isClaimed ? <ExternalLink className="w-4 h-4 text-slate-700"/> : <PoapIcon />
                          }
                          <p className="text-sm font-medium text-slate-700">{buttonText}</p>
                        </div>
                        // <Button 
                        //   variant="outline" 
                        //   size="sm" 
                        //   className="w-full bg-transparent text-sm"
                        //   onClick={() => window.open(mainPoap.poap_url, '_blank')}
                        // >
                        //   {isClaimed ? <ExternalLink className="w-4 h-4" /> : <PoapIcon />}
                        //   {buttonText}
                        // </Button>
                      )
                    })()}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        
        </div>
      </div>
    </Card>
  )
}


const PoapIcon = () => {
  return (
    <svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.08781 24.2146C8.07994 24.2367 8.06562 24.2559 8.04669 24.2698C8.02777 24.2837 8.00511 24.2916 7.98164 24.2925H7.97617C7.9536 24.2925 7.93149 24.286 7.91245 24.2739C7.8934 24.2618 7.8782 24.2446 7.86863 24.2242L6.99304 22.3526C6.85896 22.0655 6.593 21.8774 6.29913 21.861C6.16814 21.8536 6.03737 21.8787 5.91851 21.9342L4.00834 22.8218C3.98708 22.8316 3.96337 22.835 3.9402 22.8314C3.91703 22.8278 3.89544 22.8175 3.87815 22.8017C3.86085 22.7859 3.84863 22.7653 3.84302 22.7426C3.83742 22.7199 3.83867 22.696 3.84663 22.674L5.2008 18.9603C5.0728 18.888 4.95148 18.8046 4.83825 18.7109L3.30376 22.922C3.27858 22.9908 3.27442 23.0656 3.29182 23.1368C3.30921 23.208 3.34738 23.2724 3.40149 23.322C3.4556 23.3715 3.52322 23.4039 3.59579 23.4151C3.66836 23.4262 3.74261 23.4156 3.80915 23.3846L6.09911 22.3195C6.18825 22.2783 6.29014 22.274 6.38245 22.3075C6.47477 22.3411 6.54999 22.4099 6.59163 22.4987L7.65876 24.7819C7.68982 24.8483 7.73991 24.904 7.8027 24.942C7.86549 24.9801 7.93817 24.9986 8.01153 24.9954C8.0849 24.9922 8.15567 24.9673 8.21488 24.924C8.27409 24.8806 8.31909 24.8207 8.34419 24.7518L9.99032 20.2376C9.84312 20.2372 9.69624 20.2238 9.55142 20.1975L8.08781 24.2146Z" fill="#5C5AA0" stroke="#5C5AA0" strokeWidth="0.436967"/>
      <path d="M16.1819 22.6768C16.1899 22.6988 16.1912 22.7227 16.1856 22.7455C16.1801 22.7683 16.1678 22.7889 16.1505 22.8047C16.1332 22.8205 16.1116 22.8309 16.0884 22.8345C16.0652 22.8381 16.0414 22.8347 16.0201 22.8248L14.1442 21.9536C13.8563 21.82 13.5315 21.8468 13.2959 22.0232C13.2839 22.0322 13.2724 22.0412 13.2612 22.0505C13.172 22.1251 13.1005 22.2183 13.0516 22.3236L12.1609 24.2297C12.1515 24.2501 12.1364 24.2675 12.1174 24.2796C12.0984 24.2918 12.0763 24.2982 12.0537 24.2982H12.0482C12.0247 24.2973 12.0021 24.2894 11.9832 24.2756C11.9642 24.2617 11.9499 24.2425 11.942 24.2204L10.473 20.1978C10.3286 20.2253 10.1821 20.2402 10.0352 20.2423L11.6851 24.7587C11.7104 24.8272 11.7554 24.8868 11.8145 24.9299C11.8736 24.9729 11.9442 24.9976 12.0173 25.0008C12.0904 25.0039 12.1628 24.9854 12.2255 24.9476C12.2881 24.9098 12.3381 24.8543 12.3692 24.7882L13.4363 22.5033C13.478 22.4146 13.5532 22.3459 13.6455 22.3123C13.7378 22.2787 13.8397 22.283 13.9288 22.3242L16.2174 23.3869C16.284 23.4177 16.3582 23.4282 16.4308 23.417C16.5033 23.4058 16.5709 23.3734 16.625 23.3238C16.6791 23.2743 16.7172 23.2099 16.7346 23.1387C16.752 23.0675 16.7479 22.9928 16.7228 22.9239L15.1823 18.6992C15.0698 18.7942 14.949 18.879 14.8214 18.9527L16.1819 22.6768Z" fill="#5C5AA0" stroke="#5C5AA0" strokeWidth="0.436967"/>
      <path d="M19.3075 9.38185L18.9543 8.77118C18.7754 8.46251 18.6811 8.11233 18.6807 7.75576V7.05032C18.68 6.61532 18.5649 6.18812 18.3469 5.81142C18.129 5.43472 17.8158 5.12172 17.4387 4.90369L16.8288 4.55056C16.5195 4.37235 16.2626 4.11607 16.084 3.80743L15.7307 3.19649C15.5122 2.82008 15.1986 2.50751 14.8211 2.29002C14.4436 2.07253 14.0156 1.95774 13.5798 1.95712H12.8724C12.5152 1.9566 12.1644 1.86242 11.8551 1.68401L11.2433 1.33116C10.8655 1.11419 10.4373 1 10.0014 1C9.56558 1 9.13736 1.11419 8.75959 1.33116L8.14749 1.68401C7.83821 1.86245 7.48738 1.95663 7.13016 1.95712H6.42366C5.98782 1.95774 5.55977 2.07253 5.18231 2.29002C4.80485 2.50751 4.49119 2.82008 4.2727 3.19649L3.91945 3.8077C3.74083 4.1162 3.48407 4.37239 3.17492 4.55056L2.56309 4.90342C2.18597 5.12144 1.87277 5.43445 1.65483 5.81115C1.43688 6.18785 1.32181 6.61505 1.32111 7.05005V7.75549C1.32068 8.11205 1.22632 8.46224 1.04749 8.77091L0.695061 9.38185C0.477687 9.75892 0.363281 10.1863 0.363281 10.6214C0.363281 11.0564 0.477687 11.4838 0.695061 11.8609L1.04831 12.4707C1.22714 12.7794 1.32151 13.1296 1.32193 13.4861V14.1913C1.32272 14.6263 1.43782 15.0535 1.65576 15.4302C1.8737 15.807 2.18684 16.12 2.56392 16.3382L3.17492 16.6919C3.4842 16.8701 3.74107 17.1264 3.91972 17.435L4.27297 18.0459C4.49479 18.4283 4.81469 18.7446 5.19974 18.9625C5.25227 18.9923 5.3059 19.0199 5.36035 19.0444C5.69227 19.2019 6.05509 19.2837 6.42256 19.284H7.12906C7.48629 19.2844 7.83712 19.3786 8.1464 19.5571L8.75959 19.9102C8.95229 20.0211 9.1591 20.1055 9.37442 20.1612C9.43298 20.1765 9.49208 20.1885 9.55146 20.2002C9.6959 20.2267 9.8424 20.2403 9.98925 20.2409H10.0005H10.0355C10.1825 20.2388 10.3289 20.2239 10.4733 20.1964C10.5324 20.1849 10.5912 20.1716 10.6498 20.1557C10.8574 20.0998 11.0568 20.0172 11.243 19.9099L11.8548 19.5571C12.1641 19.3786 12.5149 19.2845 12.8722 19.284H13.5787C13.9538 19.2836 14.324 19.1984 14.6614 19.0346C14.7161 19.0073 14.7708 18.98 14.8217 18.9499C15.1984 18.7325 15.5114 18.4204 15.7296 18.0446L16.0829 17.4336C16.2621 17.1254 16.5193 16.8696 16.8288 16.6919L17.4406 16.3393C17.8178 16.121 18.1309 15.8078 18.3487 15.4308C18.5665 15.0539 18.6814 14.6264 18.6817 14.1913V13.4869C18.6822 13.1304 18.7765 12.7802 18.9554 12.4715L19.3086 11.8609C19.5258 11.4837 19.64 11.0562 19.6399 10.6212C19.6397 10.1862 19.5251 9.75882 19.3075 9.38185ZM18.2327 14.1913C18.2321 14.5476 18.1379 14.8976 17.9594 15.2062C17.7808 15.5148 17.5243 15.7712 17.2154 15.9498L16.6033 16.3024C16.2259 16.5203 15.9125 16.8332 15.6943 17.21L15.3411 17.8206C15.1621 18.129 14.9051 18.3851 14.5959 18.5633C14.2867 18.7414 13.936 18.8355 13.5789 18.8361H12.8724C12.4361 18.8364 12.0076 18.9513 11.6299 19.1692L11.0178 19.5218C10.7083 19.6995 10.3575 19.793 10.0005 19.793C9.64343 19.793 9.29264 19.6995 8.98314 19.5218L8.37132 19.1692C7.99362 18.9519 7.56533 18.8373 7.12933 18.8371H6.42366C6.06663 18.8366 5.71599 18.7426 5.4068 18.5644C5.09761 18.3862 4.84071 18.1301 4.66179 17.8217L4.30827 17.2111C4.09022 16.8342 3.77675 16.5213 3.39929 16.3035L2.78719 15.9509C2.47816 15.7722 2.22157 15.5156 2.04308 15.2068C1.86459 14.898 1.77047 14.5478 1.77013 14.1913V13.4869C1.7699 13.0519 1.65516 12.6245 1.4374 12.2476L1.08388 11.6366C0.90586 11.3278 0.812168 10.9777 0.812168 10.6214C0.812168 10.265 0.90586 9.91494 1.08388 9.60607L1.4374 8.99513C1.65516 8.61823 1.7699 8.19084 1.77013 7.75576V7.05032C1.77067 6.694 1.86488 6.34406 2.04335 6.03547C2.22183 5.72688 2.47832 5.47044 2.78719 5.29178L3.39929 4.93919C3.77675 4.72144 4.09022 4.40847 4.30827 4.03165L4.66179 3.42098C4.84076 3.11264 5.09766 2.85658 5.40684 2.67839C5.71602 2.5002 6.06664 2.40613 6.42366 2.40556H7.13016C7.56615 2.40538 7.99444 2.29085 8.37214 2.07346L8.98396 1.72088C9.29346 1.5432 9.64425 1.44968 10.0013 1.44968C10.3583 1.44968 10.7091 1.5432 11.0186 1.72088L11.6299 2.07346C12.0076 2.29078 12.4359 2.4053 12.8719 2.40556H13.5784C13.9354 2.40616 14.2861 2.50025 14.5953 2.67843C14.9045 2.85661 15.1615 3.11266 15.3405 3.42098L15.6943 4.03165C15.9125 4.40837 16.2259 4.72132 16.6033 4.93919L17.2154 5.29178C17.5243 5.47043 17.7808 5.72685 17.9594 6.03544C18.1379 6.34404 18.2321 6.69398 18.2327 7.05032V7.75576C18.2328 8.19086 18.3476 8.61828 18.5655 8.99513L18.9187 9.60607C19.0967 9.91494 19.1904 10.265 19.1904 10.6214C19.1904 10.9777 19.0967 11.3278 18.9187 11.6366L18.5655 12.2476C18.3476 12.6244 18.2328 13.0519 18.2327 13.4869V14.1913Z" fill="#5C5AA0" stroke="#5C5AA0" strokeWidth="0.436967"/>
      <path d="M5.86315 11.1568C6.02562 11.067 6.1567 10.9298 6.23884 10.7636C6.32694 10.5918 6.37182 10.3725 6.37182 10.1119C6.37182 9.85139 6.32694 9.63181 6.23884 9.45647C6.1574 9.28922 6.02645 9.15098 5.8637 9.06046C5.70363 8.97252 5.51182 8.92773 5.29428 8.92773H4.4269C4.33137 8.92788 4.23979 8.96582 4.17224 9.03324C4.10469 9.10067 4.06668 9.19207 4.06653 9.28742V12.6565C4.06518 12.6902 4.07478 12.7234 4.09389 12.7513C4.10305 12.7638 4.11519 12.774 4.12923 12.7807C4.14327 12.7875 4.15877 12.7907 4.17434 12.79H4.40774C4.42349 12.7905 4.43913 12.7872 4.45339 12.7806C4.46765 12.7739 4.48013 12.7639 4.48983 12.7515C4.51051 12.7242 4.52114 12.6907 4.51993 12.6565V11.3898C4.52 11.3632 4.5306 11.3378 4.54942 11.319C4.56824 11.3002 4.59374 11.2896 4.62035 11.2896H5.29264C5.51127 11.2896 5.70308 11.2451 5.86315 11.1568ZM5.91787 10.1119C5.91787 10.3397 5.86315 10.5159 5.75644 10.6349C5.64972 10.754 5.48664 10.8141 5.27267 10.8141H4.62172C4.59382 10.814 4.5671 10.8029 4.5474 10.7832C4.52771 10.7635 4.51664 10.7368 4.51664 10.7089V9.50946C4.51672 9.48166 4.52781 9.45503 4.5475 9.43538C4.56719 9.41573 4.59387 9.40465 4.62172 9.40458H5.27157C5.49047 9.40458 5.65602 9.46658 5.75972 9.5892C5.86342 9.71183 5.91678 9.88744 5.91678 10.1119H5.91787Z" fill="#5C5AA0" stroke="#5C5AA0" strokeWidth="0.436967"/>
      <path d="M10.4312 12.7893H10.6559C10.6718 12.7903 10.6877 12.7877 10.7024 12.7815C10.7171 12.7752 10.7301 12.7657 10.7404 12.7535C10.7564 12.7358 10.7674 12.7142 10.7724 12.691L10.9878 11.9973C10.9951 11.9735 11.0099 11.9527 11.0299 11.938C11.05 11.9232 11.0742 11.9153 11.0991 11.9153H12.3616C12.3866 11.9153 12.4109 11.9232 12.431 11.9379C12.4511 11.9527 12.4659 11.9735 12.4733 11.9973L12.6886 12.691C12.6963 12.7134 12.7077 12.7345 12.7223 12.7532C12.732 12.7655 12.7445 12.7751 12.7588 12.7814C12.7731 12.7877 12.7888 12.7904 12.8044 12.7893H13.029C13.0422 12.789 13.0552 12.7856 13.0669 12.7794C13.0786 12.7732 13.0887 12.7643 13.0963 12.7535C13.1148 12.7303 13.1245 12.7013 13.1237 12.6716C13.1233 12.6505 13.1203 12.6296 13.1146 12.6093L12.0281 9.0537C12.018 9.02037 12.0009 8.98955 11.978 8.9633C11.9651 8.95092 11.9498 8.94138 11.9329 8.93531C11.9161 8.92924 11.8982 8.92677 11.8803 8.92807H11.5793C11.5615 8.92677 11.5436 8.92924 11.5267 8.93531C11.5099 8.94138 11.4945 8.95092 11.4817 8.9633C11.4585 8.98947 11.4414 9.02043 11.4316 9.05397L10.3401 12.6112C10.3375 12.6314 10.3362 12.6518 10.336 12.6721C10.3351 12.7018 10.3448 12.7308 10.3634 12.7541C10.3711 12.7648 10.3813 12.7737 10.393 12.7798C10.4048 12.7859 10.4179 12.7892 10.4312 12.7893ZM11.1623 11.3729L11.6893 9.64471C11.6922 9.6361 11.6977 9.6286 11.7051 9.62329C11.7124 9.61797 11.7213 9.61511 11.7304 9.61511C11.7395 9.61511 11.7483 9.61797 11.7557 9.62329C11.7631 9.6286 11.7686 9.6361 11.7714 9.64471L12.2982 11.3729C12.3 11.3794 12.3004 11.3862 12.2992 11.3929C12.298 11.3995 12.2953 11.4058 12.2913 11.4112C12.2873 11.4166 12.2821 11.4211 12.2761 11.4241C12.27 11.4272 12.2633 11.4287 12.2566 11.4287H11.2037C11.197 11.4286 11.1905 11.427 11.1846 11.4241C11.1787 11.4211 11.1735 11.4168 11.1695 11.4115C11.1655 11.4062 11.1628 11.4001 11.1615 11.3936C11.1603 11.3871 11.1606 11.3804 11.1623 11.374V11.3729Z" fill="#5C5AA0" stroke="#5C5AA0" strokeWidth="0.436967"/>
      <path d="M8.18321 12.6545C8.20539 12.6928 8.23732 12.7245 8.27576 12.7465C8.3142 12.7686 8.35779 12.78 8.40211 12.7798H8.40348C8.44801 12.7798 8.49174 12.768 8.5302 12.7456C8.56867 12.7232 8.60047 12.691 8.62238 12.6523L9.56009 11.0136C9.60363 10.9375 9.62586 10.8511 9.62447 10.7635C9.62307 10.6758 9.5981 10.5902 9.55215 10.5155L8.60569 8.97789C8.58295 8.94107 8.55115 8.91066 8.51331 8.88958C8.47547 8.86849 8.43286 8.85742 8.38952 8.85742C8.34619 8.85742 8.30357 8.86849 8.26573 8.88958C8.2279 8.91066 8.1961 8.94107 8.17336 8.97789L7.22881 10.5128C7.18232 10.5881 7.15724 10.6746 7.15628 10.7631C7.15531 10.8516 7.1785 10.9387 7.22334 11.015L8.18321 12.6545ZM8.45683 9.63936L9.14089 10.7493C9.148 10.7612 9.15175 10.7748 9.15175 10.7887C9.15175 10.8026 9.148 10.8163 9.14089 10.8282L8.46586 12.0075C8.45906 12.0192 8.44929 12.029 8.43752 12.0357C8.42576 12.0425 8.41241 12.0461 8.39883 12.0461C8.38524 12.0461 8.37189 12.0425 8.36013 12.0357C8.34836 12.029 8.33859 12.0192 8.33179 12.0075L7.64061 10.8279C7.63343 10.8159 7.62964 10.8022 7.62964 10.7882C7.62964 10.7742 7.63343 10.7605 7.64061 10.7485L8.32467 9.63881C8.33174 9.62784 8.34146 9.61883 8.35294 9.61261C8.36442 9.60638 8.37729 9.60315 8.39036 9.6032C8.40342 9.60326 8.41626 9.6066 8.42769 9.61292C8.43912 9.61924 8.44876 9.62833 8.45574 9.63936H8.45683Z" fill="#5C5AA0" stroke="#5C5AA0" strokeWidth="0.436967"/>
      <path d="M15.8202 9.06047C15.6598 8.97252 15.4683 8.92773 15.2508 8.92773H14.3839C14.2884 8.92788 14.1968 8.96582 14.1293 9.03324C14.0617 9.10067 14.0237 9.19207 14.0236 9.28742V12.6554C14.0222 12.6891 14.0318 12.7224 14.0509 12.7502C14.0602 12.7627 14.0724 12.7729 14.0864 12.7796C14.1005 12.7864 14.116 12.7896 14.1317 12.7889H14.3651C14.3808 12.7894 14.3964 12.7861 14.4107 12.7794C14.4249 12.7728 14.4374 12.7628 14.4471 12.7504C14.4678 12.7232 14.4784 12.6896 14.4772 12.6554V11.3887C14.4773 11.3622 14.4879 11.3367 14.5067 11.3179C14.5255 11.2991 14.551 11.2886 14.5777 11.2885H15.25C15.4689 11.2885 15.6604 11.244 15.8194 11.1558C15.9816 11.0659 16.1125 10.9287 16.1945 10.7625C16.2826 10.5904 16.3272 10.3711 16.3272 10.1108C16.3272 9.85057 16.2826 9.63072 16.1945 9.45538C16.1131 9.28865 15.9825 9.15082 15.8202 9.06047ZM14.4737 9.50836C14.4738 9.48057 14.4848 9.45394 14.5045 9.43429C14.5242 9.41463 14.5509 9.40356 14.5788 9.40349H15.2286C15.4475 9.40349 15.6117 9.46549 15.7168 9.58811C15.8218 9.71074 15.8724 9.88635 15.8724 10.1108C15.8724 10.3353 15.8177 10.5148 15.7113 10.6338C15.6048 10.7529 15.4418 10.813 15.2275 10.813H14.5788C14.5509 10.8129 14.5241 10.8018 14.5044 10.7821C14.4847 10.7624 14.4737 10.7357 14.4737 10.7079V9.50836Z" fill="#5C5AA0" stroke="#5C5AA0" strokeWidth="0.436967"/>
    </svg>
  )
}

export default PopupsHistory