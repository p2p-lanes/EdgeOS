"use client"
import type { ReactNode } from "react"

const Layout = ({ children }: { children: ReactNode }) => {
  return <div className="py-6">{children}</div>
}
export default Layout
