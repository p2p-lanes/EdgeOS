import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"

const Modal = ({open, onClose, title, description, children, className}: {open: boolean, onClose: () => void, title: string, description?: React.ReactNode, children: React.ReactNode, className?: string}) => {

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`bg-white rounded-lg ${className}`}>
        <DialogHeader className="text-left pb-0">
          <DialogTitle className="text-xl font-bold text-gray-900">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-gray-600 mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="pt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
export default Modal