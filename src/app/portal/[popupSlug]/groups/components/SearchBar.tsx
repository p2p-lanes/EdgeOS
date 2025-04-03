import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface SearchBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  totalMembers: number
}

const SearchBar = ({ searchTerm, setSearchTerm, totalMembers }: SearchBarProps) => {
  return (
    <div className="mb-4">
      <p className="text-sm text-gray-500 mb-2">{totalMembers}/20 members</p>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search members"
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  )
}

export default SearchBar 