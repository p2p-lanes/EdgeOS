"use client"

import type { PopupPublic } from "@edgeos/api-client"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu"
import { motion } from "framer-motion"
import { ChevronsUpDown } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useCityProvider } from "@/providers/cityProvider"
import { DropdownMenuContent, DropdownMenuItem } from "./DropdownMenu"
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./SidebarComponents"

const PopupsMenu = () => {
  const { getCity, getPopups } = useCityProvider()
  const { state } = useSidebar()
  const router = useRouter()
  const isCollapsed = state === "collapsed"
  const city = getCity()
  const popups = getPopups()
  const cityDate = new Date(city?.start_date ?? "")?.toLocaleDateString(
    "en-EN",
    { day: "numeric", month: "long", year: "numeric" },
  )

  const handleClickCity = useCallback(
    (popup: PopupPublic) => {
      router.replace(`/portal/${popup.slug}`)
    },
    [router],
  )

  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="h-full w-full justify-between"
                tooltip={isCollapsed ? city?.name : undefined}
              >
                {!popups.length || !city ? (
                  <div className="flex items-center gap-3">
                    <div className="flex aspect-square size-8 animate-pulse items-center justify-center rounded-lg bg-gray-200" />
                    {!isCollapsed && (
                      <div className="flex flex-col gap-0.5">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <motion.div
                      initial={{ y: 0 }}
                      animate={{ y: [0, 6, 0] }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeIn",
                      }}
                      className="relative aspect-square shrink-0"
                    >
                      <Image
                        src="https://simplefi.s3.us-east-2.amazonaws.com/edge_island.png"
                        alt="EdgeCity illustration"
                        width={48}
                        height={48}
                      />
                    </motion.div>
                    {!isCollapsed && (
                      <div className="flex flex-col gap-0.5 overflow-hidden text-sm">
                        <span className="truncate font-semibold">
                          {city.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {cityDate}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                {!isCollapsed && (
                  <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="start"
              sideOffset={4}
              className="w-[--radix-dropdown-menu-trigger-width]"
            >
              {popups.map((popup: PopupPublic) => (
                <DropdownMenuItem
                  key={popup.name}
                  selected={popup.slug === city?.slug}
                  className="cursor-pointer"
                  onClick={() => handleClickCity(popup)}
                >
                  <span>{popup.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
export default PopupsMenu
