import { StaticImageData } from "next/image"

export interface PoapProps {
  id: number
  title: string
  location: string
  status: 'mint' | 'minted' | 'disabled',
  image: string
}

