'use client'

import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  onChange: (selectedValues: string[]) => void
  defaultValue?: string[]
}

export function MultiSelect({ options, onChange, defaultValue }: MultiSelectProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(defaultValue ?? [])

   const toggleOption = (value: string) => {
    setSelectedOptions((prev) => {
      const newSelection = prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
      return newSelection
    })
  }

  // Agregar un useEffect para manejar el cambio de selección
  React.useEffect(() => {
    onChange(selectedOptions)
  }, [selectedOptions])

  return (
    <div className="w-full max-w-2xl">
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option.value)
          return (
            <button
              type='button'
              key={option.value}
              onClick={() => toggleOption(option.value)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-gray-700 text-white hover:bg-gray-800'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              <span className="mr-2">{option.label}</span>
              {isSelected ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

