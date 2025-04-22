"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import BuyPasses from "@/app/portal/[popupSlug]/passes/Tabs/BuyPasses"
import Providers from "./providers/Providers"
import { ArrowLeft } from "lucide-react"

interface PassesCheckoutProps {
  onBack: () => void;
}

// Componente principal que utiliza los providers originales
const PassesCheckout = ({ onBack }: PassesCheckoutProps) => {
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto backdrop-blur bg-[#F5F5F5] rounded-xl border shadow-md"
    >
      <Providers>
        <div className="relative p-6">
          <button
            onClick={onBack}
            onKeyDown={(e) => e.key === 'Enter' && onBack()}
            className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Go back to previous step"
            tabIndex={0}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span>Back</span>
          </button>
          
          <div className="pt-8">
            <BuyPasses floatingBar={false} viewInvoices={false} canEdit={false} defaultOpenDiscount={true} positionCoupon={'right'}/>
          </div>
        </div>
      </Providers>
    </motion.div>
  )
}

export default PassesCheckout 