import { useState, useEffect } from "react"

const useWindow = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return {
    isClient,
    window: isClient ? window : undefined
  }
}
export default useWindow