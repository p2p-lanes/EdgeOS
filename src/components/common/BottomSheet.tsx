import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState } from "react"

interface BottomSheetProps {
  children: (isModal: boolean) => React.ReactNode
  className?: string
}

const BottomSheet = ({ children, className }: BottomSheetProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const targetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting)
      },
      {
        threshold: 0.5,
        rootMargin: "0px" 
      }
    )

    if (targetRef.current) {
      observer.observe(targetRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn("fixed bottom-0 left-0 right-0 z-50", className)}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "180%" }}
            transition={{ type: "spring", damping:30 }}
          >
            {children(true)}
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={targetRef}>
        {children(false)} 
      </div>
    </>
  )
}

export default BottomSheet