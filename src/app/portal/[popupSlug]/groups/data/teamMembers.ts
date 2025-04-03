import { Member } from "../types"

// Datos de ejemplo de los miembros del equipo
export const teamMembers: Member[] = [
  {
    id: '1',
    name: 'Jhon Doe',
    isPassHolder: true,
    gender: 'Male',
    email: 'jhondoe@muvinai.com',
    telegramId: '@jhondoe',
    organization: 'Muvinai',
    role: 'UX UI Designer',
    passes: [
      { type: 'VIP', color: 'green' },
      { type: 'Standard', color: 'blue' },
      { type: 'Special', color: 'red' }
    ]
  },
  {
    id: '2',
    name: 'Mateo Moragues',
    isPassHolder: true,
    gender: 'Male',
    email: 'mateo@muvinai.com',
    telegramId: '@mateo',
    organization: 'Muvinai',
    role: 'Frontend Developer',
    passes: [
      { type: 'VIP', color: 'green' },
      { type: 'Standard', color: 'blue' }
    ]
  },
  {
    id: '3',
    name: 'Joel Alfaro',
    isPassHolder: true,
    gender: 'Male',
    email: 'joel@muvinai.com',
    telegramId: '@joel',
    organization: 'Muvinai',
    role: 'Backend Developer',
    passes: [
      { type: 'Standard', color: 'blue' }
    ]
  },
  {
    id: '4',
    name: 'Alejandro Romeo',
    isPassHolder: true,
    gender: 'Male',
    email: 'alejandro@muvinai.com',
    telegramId: '@alejandro',
    organization: 'Muvinai',
    role: 'Product Manager',
    passes: [
      { type: 'VIP', color: 'green' }
    ]
  },
  {
    id: '5',
    name: 'Francisco Viñas',
    isPassHolder: true,
    gender: 'Male',
    email: 'francisco@muvinai.com',
    telegramId: '@francisco',
    organization: 'Muvinai',
    role: 'DevOps Engineer',
    passes: [
      { type: 'Standard', color: 'blue' }
    ]
  },
  {
    id: '6',
    name: 'Ignacio Barbero',
    isPassHolder: false,
    gender: 'Male',
    email: 'ignacio@muvinai.com',
    telegramId: '@ignacio',
    organization: 'Muvinai',
    role: 'Data Analyst',
    passes: []
  },
  {
    id: '7',
    name: 'Sofia Gastaldi',
    isPassHolder: false,
    gender: 'Female',
    email: 'sofia@muvinai.com',
    telegramId: '@sofia',
    organization: 'Muvinai',
    role: 'UX Researcher',
    passes: []
  }
] 