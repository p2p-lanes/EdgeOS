import { Button } from "@/components/ui/button"
import { usePassesProvider } from "@/providers/passesProvider"
import { PencilIcon, XIcon } from "lucide-react"

const EditPassesButton = () => {
  const { toggleEditing, isEditing } = usePassesProvider()

  if(isEditing){
    return(
      <Button variant="secondary" onClick={toggleEditing}>
        <XIcon className="w-4 h-4" />
        Cancel Pass Editing
      </Button>

    )
  }

  return (
    <Button variant="outline" onClick={toggleEditing}>
      <PencilIcon className="w-4 h-4" />
      Edit Passes
    </Button>
  )

}

export default EditPassesButton