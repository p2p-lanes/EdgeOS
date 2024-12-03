import { LucideIcon } from 'lucide-react'

type ResourceStatus = 'soon' | 'active' | 'inactive';

export interface Resource {
  name: string
  icon?: LucideIcon
  status: ResourceStatus
  path?: string
  children?: Resource[]
  value?: string | number | React.ReactNode
} 