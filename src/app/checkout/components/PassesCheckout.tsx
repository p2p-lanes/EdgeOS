"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import BuyPasses from "@/app/portal/[popupSlug]/passes/Tabs/BuyPasses"
import Providers from "./providers/Providers"


// Componente principal que utiliza los providers originales
const PassesCheckout = () => {
  const [isLoading, setIsLoading] = useState(true)
  
  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading passes information...</p>
      </div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto backdrop-blur bg-[#F5F5F5] rounded-xl border shadow-md"
    >
      <Providers>
        <div className="p-6">
          {/* Reutilizando directamente el componente BuyPasses */}
          <BuyPasses floatingBar={false} viewInvoices={false}/>
        </div>
      </Providers>
    </motion.div>
  )
}

export default PassesCheckout 