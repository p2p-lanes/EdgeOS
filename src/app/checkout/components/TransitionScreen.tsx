"use client"

import { useEffect, useState } from "react"
import { Loader } from "@/components/ui/Loader"
import { motion } from "framer-motion"

interface TransitionScreenProps {
  message: string
  isPending: boolean
  isSuccess: boolean
}

const TransitionScreen = ({ message, isPending, isSuccess }: TransitionScreenProps) => {
  const [dots, setDots] = useState(".")
  
  // Efecto para animar los puntos suspensivos
  useEffect(() => {
    if (!isPending) return
    
    const interval = setInterval(() => {
      setDots(prev => prev.length < 3 ? prev + "." : ".")
    }, 500)
    
    return () => clearInterval(interval)
  }, [isPending])
  
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {isPending && (
        <>
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-6 text-lg font-medium">{message}{dots}</p>
          <p className="mt-2 text-sm text-muted-foreground">This might take a few moments</p>
        </>
      )}
      
      {isSuccess && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-green-100 text-green-800 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium">Registration successful!</p>
          <p className="mt-2 text-sm text-muted-foreground">Loading your passes...</p>
        </motion.div>
      )}
    </motion.div>
  )
}

export default TransitionScreen 