'use client'
import { useApplication } from "@/providers/applicationProvider"
import PassesProvider, { usePassesProvider } from "@/providers/passesProvider"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"
import TotalProvider from "@/providers/totalProvider"
import { GroupsProvider, useGroupsProvider } from "@/providers/groupsProvider"

const Layout = ({ children }: { children: ReactNode }) => {
  return (
      <TotalProvider>
        <div>
          {children}
        </div>
      </TotalProvider>
  )
}
export default Layout