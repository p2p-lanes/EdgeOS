"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { EdgeLand } from "@/components/Icons/EdgeLand"
import { Download } from "lucide-react"
import { saveAs } from "file-saver"

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 1200 1227" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
  </svg>
)

const LOADING_MESSAGES = [
  "Initializing world gen...",
  "Summoning waterfalls...",
  "Planting digital trees...",
  "Calibrating sunlight...",
  "Constructing villages...",
  "Finalizing your island..."
]

export default function BannerEdgeWrapped() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<"loading" | "success">("loading")
  const [messageIndex, setMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let timer: NodeJS.Timeout
    let messageInterval: NodeJS.Timeout
    let progressInterval: NodeJS.Timeout

    if (isOpen && step === "loading") {
      // Reset state on open
      setMessageIndex(0)
      setProgress(0)

      // Total loading time (simulated)
      const TOTAL_TIME = 10000
      const MESSAGE_INTERVAL = TOTAL_TIME / LOADING_MESSAGES.length
      
      timer = setTimeout(() => {
        // Preload image before success
        const img = new Image()
        img.src = "https://simplefi.s3.us-east-2.amazonaws.com/generated_image.jpeg"
        img.onload = () => setStep("success")
        img.onerror = () => setStep("success") // Fallback
      }, TOTAL_TIME)

      messageInterval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
      }, MESSAGE_INTERVAL)

      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 100
          return prev + (100 / (TOTAL_TIME / 100))
        })
      }, 100)
    }
    
    return () => {
      clearTimeout(timer)
      clearInterval(messageInterval)
      clearInterval(progressInterval)
    }
  }, [isOpen, step])

  const handleOpen = () => {
    setIsOpen(true)
    setStep("loading")
  }

  const handleDownload = () => {
    saveAs("https://simplefi.s3.us-east-2.amazonaws.com/generated_image.jpeg", "edge-city-map.jpg")
  }

  const handleShare = () => {
    const text = encodeURIComponent("I just got my Edge Mapped from @JoinEdgeCity 🔥🏝️")
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
  }

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF7B7B] to-[#E040FB] p-8 md:p-12 shadow-lg border border-gray-200">
        <div className="relative z-10 flex flex-col items-start gap-4 md:gap-6 max-w-2xl">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Get My Edge Mapped
            </h2>
            <p className="text-lg text-white/90">
              Discover your lifetime activity at Edge and get your custom island!
            </p>
          </div>
          <Button 
            onClick={handleOpen}
            size="lg" 
            className="bg-white text-black hover:bg-white/90 font-semibold text-lg px-8 transition-transform hover:scale-105 active:scale-95"
          >
            Let&apos;s go!
          </Button>
        </div>

        {/* Floating Icons Background Effect */}
        <div className="absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-center pointer-events-none opacity-20 md:opacity-30">
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="scale-[3] md:scale-[4] text-white">
              <EdgeLand />
            </div>
          </motion.div>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="sm:max-w-lg p-8 bg-white shadow-2xl gap-0"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">Edge Mapped Result</DialogTitle>
          <DialogDescription className="sr-only">Your custom Edge City island</DialogDescription>
          
          <div className="relative flex flex-col items-center justify-center min-h-[400px] w-full transition-all duration-300">
             <AnimatePresence mode="wait">
                {step === "loading" ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-8 w-full max-w-sm absolute inset-0 justify-center m-auto"
                  >
                     {/* Icon Animation */}
                     <div className="relative flex items-center justify-center h-32 w-32">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut" 
                          }}
                          className="absolute inset-0 bg-gradient-to-tr from-purple-200 to-blue-200 rounded-full blur-2xl"
                        />
                        <div className="relative z-10 scale-[2] text-black">
                          <EdgeLand />
                        </div>
                        {/* Sun/Orbit effect */}
                        <motion.div
                          className="absolute w-full h-full border border-dashed border-gray-300 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        >
                           <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_15px_2px_rgba(250,204,21,0.8)] blur-[1.5px]" />
                        </motion.div>
                     </div>

                     <div className="flex flex-col items-center gap-4 w-full">
                        <h3 className="text-xl font-bold text-black tracking-wide uppercase">
                          Construction in Progress
                        </h3>
                        
                        {/* Message Cycler */}
                        <div className="h-6 overflow-hidden relative w-full flex justify-center">
                          <AnimatePresence mode="wait">
                             <motion.p
                               key={messageIndex}
                               initial={{ y: 20, opacity: 0 }}
                               animate={{ y: 0, opacity: 1 }}
                               exit={{ y: -20, opacity: 0 }}
                               className="text-sm font-mono text-gray-500 uppercase tracking-widest absolute"
                             >
                               {LOADING_MESSAGES[messageIndex]}
                             </motion.p>
                          </AnimatePresence>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-2 relative border border-gray-200">
                          <motion.div 
                            className="h-full bg-black"
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "linear" }}
                          />
                        </div>
                     </div>
                  </motion.div>
                ) : (
                   <motion.div
                    key="success"
                    className="flex flex-col w-full gap-6"
                   >
                      <div className="relative p-1 my-2 rounded-sm bg-white">
                         {/* Removed aspect-square to allow image's natural aspect ratio, assuming the image itself has the correct dimensions (like 4:5 or 3:4) */}
                         <div className="relative w-full bg-gray-100 border border-gray-200">
                            <motion.img 
                              initial={{ filter: "blur(12px)", scale: 1.06 }}
                              animate={{ filter: "blur(0px)", scale: 1 }}
                              transition={{ duration: 3, ease: "circInOut" }}
                              src="https://simplefi.s3.us-east-2.amazonaws.com/generated_image.jpeg" 
                              alt="Edge Mapped Island"
                              className="w-full h-auto object-contain block" 
                            />
                         </div>
                      </div>
                      
                      <div className="flex gap-3 w-full">
                        <Button 
                          onClick={handleDownload} 
                          className="flex-1 gap-2 h-11 text-sm font-bold bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-md border-2 border-[#2563EB] shadow-sm uppercase tracking-wide transition-all active:translate-y-0.5"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button 
                          onClick={handleShare} 
                          className="flex-1 gap-2 h-11 text-sm font-bold bg-black hover:bg-gray-800 text-white rounded-md border-2 border-black shadow-sm uppercase tracking-wide transition-all active:translate-y-0.5"
                        >
                          <XIcon className="w-4 h-4" />
                          Share to X
                        </Button>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
