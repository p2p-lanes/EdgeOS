"use client"

import type * as React from "react"
import FooterMenu from "./FooterMenu"
import PopupsMenu from "./PopupsMenu"
import ResourcesMenu from "./ResourcesMenu"
import { Sidebar } from "./SidebarComponents"

export function BackofficeSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <PopupsMenu />
      <ResourcesMenu />
      <FooterMenu />
    </Sidebar>
  )
}
