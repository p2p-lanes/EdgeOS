"use client"

import type { PopupPublic } from "@edgeos/api-client"
import { useParams } from "next/navigation"
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react"
import { usePopupsQuery } from "@/hooks/useGetPopups"

interface CityContext_interface {
  getCity: () => PopupPublic | null
  getPopups: () => PopupPublic[]
  setCityPreselected: (cityId: string) => void
  popupsLoaded: boolean
}

export const CityContext = createContext<CityContext_interface | null>(null)

const CityProvider = ({ children }: { children: ReactNode }) => {
  const { data: popups = [], isFetched } = usePopupsQuery()
  const [cityPreselected, setCityPreselected] = useState<string | null>(null)
  const params = useParams()

  const popupsLoaded = isFetched

  const getValidCity = useCallback((): PopupPublic | null => {
    return popups.find((popup) => popup.slug === params.popupSlug) ?? null
  }, [popups, params.popupSlug])

  const getCity = useCallback((): PopupPublic | null => {
    const city = getValidCity()
    if (cityPreselected) {
      const selectedCity = popups.find((popup) => popup.id === cityPreselected)
      if (selectedCity) return selectedCity
    } else if (!city) {
      return popups[0] ?? null
    }
    return city ?? null
  }, [getValidCity, cityPreselected, popups])

  const getPopups = useCallback((): PopupPublic[] => {
    return popups
  }, [popups])

  return (
    <CityContext.Provider
      value={{
        getCity,
        getPopups,
        setCityPreselected,
        popupsLoaded,
      }}
    >
      {children}
    </CityContext.Provider>
  )
}

export const useCityProvider = (): CityContext_interface => {
  const context = useContext(CityContext)
  if (context === null) {
    throw new Error("useCityProvider must be used within a CityProvider")
  }
  return context
}

export default CityProvider
