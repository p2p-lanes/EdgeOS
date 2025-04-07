import { ApplicationProps } from "./Application"

export type Member = ApplicationProps & {
  isPassHolder: boolean
} 

export interface GroupProps {
  id: string
  name: string
  members: Member[]
  slug: string
}