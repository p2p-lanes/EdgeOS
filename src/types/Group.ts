import { ProductsProps } from "@/types/Products"

// Tipo para representar un miembro
export type Member = {
  id: number,
  email: string,
  first_name: string,
  last_name: string,
  telegram: string | null,
  organization: string | null,
  role: string | null,
  gender: string | null,
  products: ProductsProps[]
  isPassHolder: boolean
} 
export interface GroupProps {
  id: string
  name: string
  members: Member[],
  max_members: number,
  slug: string
}