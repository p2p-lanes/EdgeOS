"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { saveAs } from "file-saver"
import { XIcon } from "./XIcon"

interface SuccessStateProps {
  imageUrl: string
}

export const SuccessState = ({ imageUrl }: SuccessStateProps) => {
  const handleDownload = () => {
    saveAs(imageUrl, "edge-city-map.jpg")
  }

  const handleShare = () => {
    const text = encodeURIComponent("I just got my Edge Mapped from @JoinEdgeCity 🔥🏝️")
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
  }

  return (
    <motion.div
      key="success"
      className="flex flex-col w-full gap-6"
    >
      <div className="relative p-1 my-2 rounded-sm bg-white">
        <div className="relative w-full bg-gray-100 border border-gray-200">
          <motion.img 
            initial={{ filter: "blur(12px)", scale: 1.06 }}
            animate={{ filter: "blur(0px)", scale: 1 }}
            transition={{ duration: 3, ease: "circInOut" }}
            src={imageUrl} 
            alt="Edge Mapped Island"
            className="w-full h-auto object-contain block" 
          />
        </div>
      </div>
      
      <div className="flex gap-3 w-full">
        <Button 
          onClick={handleDownload} 
          className="flex-1 gap-2 h-11 text-sm font-bold bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-md border-2 border-[#2563EB] shadow-sm uppercase tracking-wide transition-all active:translate-y-0.5"
          aria-label="Download your Edge Mapped image"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
        <Button 
          onClick={handleShare} 
          className="flex-1 gap-2 h-11 text-sm font-bold bg-black hover:bg-gray-800 text-white rounded-md border-2 border-black shadow-sm uppercase tracking-wide transition-all active:translate-y-0.5"
          aria-label="Share to X (Twitter)"
        >
          <XIcon className="w-4 h-4" />
          Share to X
        </Button>
      </div>
    </motion.div>
  )
}

