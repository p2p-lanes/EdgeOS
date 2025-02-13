import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog"

const Modal = ({open, onClose, title, description, children}: {open: boolean, onClose: () => void, title: string, description: string, children: React.ReactNode}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-neutral-100">
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