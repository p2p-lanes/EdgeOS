"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import BuyPasses from "@/app/portal/[popupSlug]/passes/Tabs/BuyPasses"
import Providers from "./providers/Providers"


// Componente principal que utiliza los providers originales
const PassesCheckout = () => {
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto backdrop-blur bg-[#F5F5F5] rounded-xl border shadow-md"
    >
      <Providers>
        <div className="p-6">
          <BuyPasses floatingBar={false} viewInvoices={false} canEdit={false} defaultOpenDiscount={true} positionCoupon={'right'}/>
        </div>
      </Providers>
    </motion.div>
  )
}

export default PassesCheckout 