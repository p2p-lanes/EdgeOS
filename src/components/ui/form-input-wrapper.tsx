import React from 'react'

interface FormInputWrapperProps {
  children: React.ReactNode
}

export function FormInputWrapper({ children }: FormInputWrapperProps) {
  return (
    <div className="space-y-2">
      {children}
    </div>
  )
}

