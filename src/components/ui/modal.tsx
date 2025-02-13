import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"

const Modal = ({open, onClose, title, description, children, className}: {open: boolean, onClose: () => void, title: string, description?: string, children: React.ReactNode, className?: string}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={` bg-neutral-100 ${className} `}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
export default Modal