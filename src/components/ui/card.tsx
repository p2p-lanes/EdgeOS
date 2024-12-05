import * as React from "react"

import { cn } from "@/lib/utils"
import { motion, Transition, Variants } from "framer-motion"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

type AnimationType = 'entry' | 'hover' | 'exit'

// Propiedades para nuestro componente CardAnimation
interface CardAnimationProps extends React.ComponentPropsWithoutRef<typeof Card> {
  anim?: AnimationType[]
  duration?: number
}

// Variantes de animación
const variants: Record<AnimationType, Variants> = {
  entry: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  },
  hover: {
    initial: {},
    whileHover: { boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }
  },
  exit: {
    exit: { opacity: 0, y: 20 }
  }
}

const CardAnimation = React.forwardRef<
  HTMLDivElement,
  CardAnimationProps
>(({ className, anim = [], children, duration = 0.6, ...props }, ref) => {
  // Combinamos las variantes de animación según los tipos especificados
  const combinedVariants: Variants = anim.reduce((acc, type) => ({
    ...acc,
    ...variants[type]
  }), {})

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="whileHover"
      exit="exit"
      variants={combinedVariants}
      transition={{ duration }}
      className="rounded-xl"
    >
      <Card
        ref={ref}
        className={cn("transition-all duration-300", className)}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  )
})

CardAnimation.displayName = 'CardAnimation'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardAnimation }
