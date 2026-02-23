import { LogOut, Medal, Newspaper } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import InvoiceModal from "@/app/portal/[popupSlug]/passes/components/common/InvoiceModal"
import useAuth from "@/hooks/useAuth"
import { SidebarTrigger } from "../Sidebar/SidebarComponents"
import { Button } from "../ui/button"

const HeaderProfile = () => {
  const router = useRouter()
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const { logout } = useAuth()

  return (
    <div className="p-4 md:p-6 border-b border-gray-200 bg-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="xl:hidden" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">
              Manage your Edge experience and history
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="text-gray-700 border-gray-300 bg-transparent"
            onClick={() => router.push("/portal/poaps")}
          >
            <Medal className="mr-2 size-4" />
            My Collectibles
          </Button>
          {/* <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50 bg-transparent">
              My Referrals
            </Button> */}
          <Button
            variant="outline"
            className="text-gray-700 border-gray-300 hover:bg-gray-50 bg-transparent"
            onClick={() => setIsInvoiceModalOpen(true)}
          >
            <Newspaper className="h-4 w-4" />
            Invoices
          </Button>
          <InvoiceModal
            isOpen={isInvoiceModalOpen}
            onClose={() => setIsInvoiceModalOpen(false)}
          />

          <div className="hidden md:block h-6 w-px bg-gray-300" />

          <Button
            variant="outline"
            className="text-gray-700 border-gray-300 hover:bg-gray-50 bg-transparent"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
export default HeaderProfile
