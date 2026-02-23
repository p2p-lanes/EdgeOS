import { toast } from "sonner"

interface ToastAction {
  label: string
  onClick: () => void
}

const useCustomToast = () => {
  const showSuccessToast = (description: string, action?: ToastAction) => {
    toast.success("Success!", {
      description,
      ...(action && {
        action: { label: action.label, onClick: action.onClick },
      }),
    })
  }

  const showErrorToast = (description: string) => {
    toast.error("Something went wrong!", {
      description,
    })
  }

  return { showSuccessToast, showErrorToast }
}

export default useCustomToast
