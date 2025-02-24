'use client'

import { useState } from "react"
import { useEffect } from "react";
import useWindow from "./useWindow";


const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)
  const { window } = useWindow()

  useEffect(() => {
    if(!window) return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [window])

  return !!isMobile
}
