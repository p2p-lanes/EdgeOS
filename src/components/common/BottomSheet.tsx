import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useRef, useState } from "react"

interface BottomSheetProps {
  children: (isModal: boolean) => React.ReactNode
}

const BottomSheet = ({ children }: BottomSheetProps) => {
  const [isVisible, setIsVisible] = useState(true)
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
            className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-neutral-200 rounded-t-2xl z-50 p-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 20 }}
          >
            {children(true)} {/* Indicamos que es modal */}
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={targetRef}>
        {children(false)} {/* Indicamos que no es modal */}
      </div>
    </>
  )
}

export default BottomSheet