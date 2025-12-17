"use client"

import { AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { LoadingState } from "./LoadingState"
import { SuccessState } from "./SuccessState"
import { ErrorState } from "./ErrorState"

export type ModalStep = "loading" | "success" | "error"

interface EdgeWrappedModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  step: ModalStep
  messageIndex: number
  imageUrl: string | null
  error: string | null
  onClose: () => void
}

export const EdgeWrappedModal = ({
  isOpen,
  onOpenChange,
  step,
  messageIndex,
  imageUrl,
  error,
  onClose
}: EdgeWrappedModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-lg max-h-[95vh] overflow-y-auto pt-12 pb-4 px-4 sm:p-8 bg-white shadow-2xl gap-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Edge Mapped Result</DialogTitle>
        <DialogDescription className="sr-only">Your custom Edge City island</DialogDescription>
        
        <div className="relative flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] w-full transition-all duration-300">
          <AnimatePresence mode="wait">
            {step === "loading" && (
              <LoadingState messageIndex={messageIndex} />
            )}
            {step === "success" && imageUrl && (
              <SuccessState imageUrl={imageUrl} />
            )}
            {step === "error" && (
              <ErrorState error={error} onClose={onClose} />
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

