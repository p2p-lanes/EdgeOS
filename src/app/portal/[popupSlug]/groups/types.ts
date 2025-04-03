// Tipo para representar un pase
export type Pass = {
  type: string
  color: string
}

// Tipo para representar un miembro
export type Member = {
  id: string
  name: string
  isPassHolder: boolean
  gender: string
  email: string
  telegramId: string
  organization: string
  role: string
  passes: Pass[]
} 