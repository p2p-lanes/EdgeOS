"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

interface SectionWrapperProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
}

const SectionWrapper = ({
  children,
  className = "",
  title,
  subtitle,
}: SectionWrapperProps) => {
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
      className={`grid gap-10 lg:grid-cols-[220px,1fr] pb-12 ${className}`}
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div className="space-y-6">{children}</div>
    </motion.div>
  )
}

export default SectionWrapper
