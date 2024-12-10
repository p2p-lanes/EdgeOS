'use client'

import { useCityProvider } from "@/providers/cityProvider"
import SectionWrapper from "./SectionWrapper"

export function FormHeader() {
  const { getCity } = useCityProvider()
  const city = getCity()

  if(!city) return null

  return (
    <SectionWrapper>
      <div className="flex items-center">
        <img
          src={city.image_url}
          alt={city.name}
          style={{ width: '20vw', height: 'auto', maxWidth: '240px', borderRadius: '14px' }}
          className="dark:invert"
        />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{city.name} Application</h1>
        {/* <p className="text-sm text-primary">
          OUR APPLICATIONS ARE NOW CLOSED. 2025 APPLICATIONS WILL OPEN SOON.
        </p> */}
      </div>
    </SectionWrapper>
  )
}

