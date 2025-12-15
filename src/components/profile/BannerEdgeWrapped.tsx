"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { EdgeLand } from "@/components/Icons/EdgeLand"
import { useGetEdgeWrapped } from "@/hooks/useGetEdgeWrapped"
import { 
  EdgeWrappedModal, 
  LOADING_MESSAGES, 
  MIN_LOADING_TIME_FIRST, 
  MIN_LOADING_TIME_RETURNING,
  type ModalStep 
} from "./EdgeWrapped"

interface BannerEdgeWrappedProps {
  edgeMappedSent?: boolean
  onImageGenerated?: () => void
}

export default function BannerEdgeWrapped({ 
  edgeMappedSent = false, 
  onImageGenerated 
}: BannerEdgeWrappedProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<ModalStep>("loading")
  const [messageIndex, setMessageIndex] = useState(0)
  const [minTimePassed, setMinTimePassed] = useState(false)
  
  const { data: imageUrl, error, fetchWrapped, reset } = useGetEdgeWrapped()
  
  const fetchStartedRef = useRef(false)
  const hasCalledOnImageGeneratedRef = useRef(false)

  // Determine loading time based on whether user already has edge mapped
  const minLoadingTime = edgeMappedSent ? MIN_LOADING_TIME_RETURNING : MIN_LOADING_TIME_FIRST

  // Reset internal refs when closing
  useEffect(() => {
    if (!isOpen) {
      fetchStartedRef.current = false
      hasCalledOnImageGeneratedRef.current = false
    }
  }, [isOpen])

  // Start Fetch and Timers when entering 'loading'
  useEffect(() => {
    let messageInterval: NodeJS.Timeout
    let minTimeTimer: NodeJS.Timeout

    if (isOpen && step === "loading") {
      // Trigger fetch only once
      if (!fetchStartedRef.current) {
        fetchStartedRef.current = true
        fetchWrapped()
      }

      const messageIntervalTime = minLoadingTime / LOADING_MESSAGES.length

      minTimeTimer = setTimeout(() => {
        setMinTimePassed(true)
      }, minLoadingTime)

      messageInterval = setInterval(() => {
        setMessageIndex((prev) => {
          if (prev >= LOADING_MESSAGES.length - 1) {
            return prev
          }
          return prev + 1
        })
      }, messageIntervalTime)
    }
    
    return () => {
      clearTimeout(minTimeTimer)
      clearInterval(messageInterval)
    }
  }, [isOpen, step, fetchWrapped, minLoadingTime])

  // Monitor Completion
  // If edgeMappedSent is true, show image immediately when API responds
  // If edgeMappedSent is false, wait for minimum loading time before showing
  useEffect(() => {
    const canProceed = edgeMappedSent ? true : minTimePassed
    
    if (step === "loading" && canProceed && (imageUrl || error)) {
      if (error) {
        setStep("error")
      } else if (imageUrl) {
        const img = new Image()
        img.src = imageUrl
        img.onload = () => {
          setStep("success")
          // Call onImageGenerated only if this was the first time (edgeMappedSent was false)
          if (!edgeMappedSent && onImageGenerated && !hasCalledOnImageGeneratedRef.current) {
            hasCalledOnImageGeneratedRef.current = true
            onImageGenerated()
          }
        }
        img.onerror = () => setStep("error")
      }
    }
  }, [step, minTimePassed, imageUrl, error, edgeMappedSent, onImageGenerated])

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleOpen = () => {
    // Reset state before opening
    setStep("loading")
    setMinTimePassed(false)
    setMessageIndex(0)
    fetchStartedRef.current = false
    hasCalledOnImageGeneratedRef.current = false
    reset()
    
    setIsOpen(true)
  }

  // Dynamic content based on edgeMappedSent
  const title = edgeMappedSent ? "See My Edge Mapped" : "Get Your Edge Mapped"
  const subtitle = edgeMappedSent 
    ? null 
    : "Discover your lifetime activity at Edge and get your custom island!"

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF7B7B] to-[#E040FB] p-8 md:p-12 shadow-lg border border-gray-200">
        <div className="relative z-10 flex flex-col items-start gap-4 md:gap-6 max-w-2xl">
          <div className={subtitle ? "space-y-2" : ""}>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg text-white/90">
                {subtitle}
              </p>
            )}
          </div>
          <Button 
            onClick={handleOpen}
            size="lg" 
            className="bg-white text-black hover:bg-white/90 font-semibold text-lg px-8 transition-transform hover:scale-105 active:scale-95"
            aria-label={title}
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

      <EdgeWrappedModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        step={step}
        messageIndex={messageIndex}
        imageUrl={imageUrl}
        error={error}
        onClose={handleClose}
      />
    </>
  )
}
