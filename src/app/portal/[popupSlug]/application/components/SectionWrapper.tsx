'use client'

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

interface SectionWrapperProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  'data-testid'?: string
}

const SectionWrapper = ({ children, className = "", title, subtitle, 'data-testid': testId }: SectionWrapperProps) => {
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
      className={`grid gap-10 xl:grid-cols-[260px,1fr] pb-12 ${className}`}
      data-testid={testId}
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight" data-testid={testId ? `${testId}-title` : undefined}>{title}</h2>
        <p className="text-muted-foreground" data-testid={testId ? `${testId}-subtitle` : undefined}>{subtitle}</p>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </motion.div>
  )
}

export default SectionWrapper

