'use client'

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

interface SectionWrapperProps {
  children: React.ReactNode
  className?: string
}

const SectionWrapper = ({ children, className = "" }: SectionWrapperProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-142px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -60 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
      transition={{
        duration: 0.6,
        ease: "backOut",
      }}
      className={`grid gap-10 lg:grid-cols-[260px,1fr] pb-12 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default SectionWrapper

