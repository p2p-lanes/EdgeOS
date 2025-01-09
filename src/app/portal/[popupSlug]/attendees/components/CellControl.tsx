import { EyeOff } from "lucide-react"

const CellControl = ({value, className}: {value: string | boolean, className: string}) => {

  if(value === '*'){
    return(
      <EyeOff className="w-4 h-4" />
    )
  }

  return (
    <div className={className}>
      {value}
    </div>
  )
}
export default CellControl