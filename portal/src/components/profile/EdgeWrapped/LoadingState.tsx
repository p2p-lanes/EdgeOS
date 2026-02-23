"use client"

import { AnimatePresence, motion } from "framer-motion"
import { EdgeLand } from "@/components/Icons/EdgeLand"
import { LOADING_MESSAGES } from "./constants"

interface LoadingStateProps {
  messageIndex: number
}

export const LoadingState = ({ messageIndex }: LoadingStateProps) => {
  return (
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
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
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
      </div>
    </motion.div>
  )
}
