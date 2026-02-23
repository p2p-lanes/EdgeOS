"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  error: string | null
  onClose: () => void
}

export const ErrorState = ({ error, onClose }: ErrorStateProps) => {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4 text-center absolute inset-0 m-auto"
    >
      <div className="text-red-500 text-xl font-bold">Something went wrong</div>
      <p className="text-gray-500">{error || "Could not generate your map."}</p>
      <Button
        onClick={onClose}
        variant="outline"
        aria-label="Close error dialog"
      >
        Close
      </Button>
    </motion.div>
  )
}
