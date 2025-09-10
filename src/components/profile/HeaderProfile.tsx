import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Medal, Newspaper, LogOut } from "lucide-react"
import InvoiceModal from "@/app/portal/[popupSlug]/passes/components/common/InvoiceModal"
import useAuthentication from "@/hooks/useAuthentication"

const HeaderProfile = () => {
  const router = useRouter()
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const { logout } = useAuthentication()


  return (
    <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your Edge experience and history</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-gray-700 border-gray-300 bg-transparent" onClick={ () => router.push('/portal/poaps')}>
              <Medal className="mr-2 size-4" />
              My Collectibles
            </Button>
            {/* <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50 bg-transparent">
              My Referrals
            </Button> */}
            <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50 bg-transparent" onClick={() => setIsInvoiceModalOpen(true)}>
              <Newspaper className="h-4 w-4" />
              Invoices
            </Button>
            <InvoiceModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} />
            
            <div className="h-6 w-px bg-gray-300" />

            <Button variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50 bg-transparent" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
  )
}
export default HeaderProfile