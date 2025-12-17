"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
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
  showBanner?: boolean
}

export default function BannerEdgeWrapped({ 
  edgeMappedSent = false, 
  onImageGenerated,
  showBanner
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

  if(!showBanner) return null

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-2xl shadow-lg border border-gray-200">
        <div className="absolute inset-0 z-0">
          <NextImage
            src="/images/background.jpeg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="relative z-10 flex flex-row items-center justify-between p-6 md:p-8 gap-4">
          <div className="flex flex-col items-start gap-3 md:gap-6 flex-1">
            <div className={subtitle ? "space-y-2 w-full" : "w-full"}>
              <h2 className="text-2xl font-bold text-black md:text-4xl font-pp-mono">
                {title}
              </h2>
              
              {subtitle && (
                <p className="text-base md:text-lg text-black/90 font-pp-mono">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="flex md:hidden w-full justify-center py-2 pointer-events-none">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full"
              >
                <div className="relative w-full h-48">
                  <NextImage 
                    src="/images/isla.png" 
                    alt="Edge Land" 
                    fill 
                    className="object-contain"
                  />
                </div>
              </motion.div>
            </div>

            <Button 
              onClick={handleOpen}
              size="lg" 
              className="w-full md:w-auto bg-white text-black hover:bg-white/90 font-semibold text-base md:text-lg px-6 md:px-8 transition-transform hover:scale-105 active:scale-95"
              aria-label={title}
            >
              Let&apos;s go!
            </Button>
          </div>

          {/* Floating Icons Background Effect */}
          <div className="hidden md:flex flex-shrink-0 items-center justify-center pointer-events-none opacity-100">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="relative w-27 h-27 md:w-52 md:h-52">
                <NextImage 
                  src="/images/isla.png" 
                  alt="Edge Land" 
                  fill 
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>
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
