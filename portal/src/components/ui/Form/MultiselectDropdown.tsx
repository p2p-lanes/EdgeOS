"use client"

import { useState } from "react"
import { Check, ChevronDown, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"


interface Option {
  value: string
  label: string
}

interface MultiSelectDropdownProps {
  options: Option[]
  onChange: (selectedValues: string[]) => void
  defaultValue?: string[]
  title?: string
}


export default function MultiSelectDropdown({ options, onChange, defaultValue, title }: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue ?? options.map((opt) => opt.value))

  const handleSelect = (value: string) => {
    const newSelectedValues = selectedValues.includes(value) 
      ? selectedValues.filter((item) => item !== value) 
      : [...selectedValues, value]
    
    setSelectedValues(newSelectedValues)
    onChange(newSelectedValues)
  }

  const handleRemove = (value: string) => {
    const newSelectedValues = selectedValues.filter((item) => item !== value)
    setSelectedValues(newSelectedValues)
    onChange(newSelectedValues)
  }

  const selectedOptions = options.filter((option) => selectedValues.includes(option.value))

  return (
    <div className="w-full">
        <label className="text-sm font-medium">{title}</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between min-h-10 h-auto bg-transparent"
            >
              <div className="flex flex-wrap gap-1 flex-1">
                {selectedValues.length === 0 ? (
                  <span className="text-muted-foreground">Select options...</span>
                ) : (
                  selectedOptions.map((option) => (
                    <Badge key={option.value} variant="secondary" className="mr-1 mb-1">
                      {option.label}
                      <span
                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            handleRemove(option.value)
                          }
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRemove(option.value)
                        }}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </span>
                    </Badge>
                  ))
                )}
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 w-full">
                        <Checkbox
                          checked={selectedValues.includes(option.value)}
                          onChange={() => handleSelect(option.value)}
                        />
                        <span className="flex-1">{option.label}</span>
                        {selectedValues.includes(option.value) && <Check className="h-4 w-4" />}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
    </div>
  )
}
