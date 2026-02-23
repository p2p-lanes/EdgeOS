import { Download } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import QRCodeReact from "react-qr-code"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const QRcode = ({
  check_in_code,
  isOpen,
  onOpenChange,
}: {
  check_in_code: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const qrCodeRef = useRef<HTMLDivElement>(null)
  const [qrValue, setQrValue] = useState("")

  useEffect(() => {
    if (check_in_code) {
      setQrValue(JSON.stringify({ code: check_in_code }))
    }
  }, [check_in_code])

  const handleDownload = () => {
    if (!qrCodeRef.current) return

    const canvas = document.createElement("canvas")
    const svg = qrCodeRef.current.querySelector("svg")

    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const DOMURL = window.URL || window.webkitURL || window
    const svgUrl = DOMURL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      // Factor de escala para aumentar el tamaño de la imagen
      const scaleFactor = 3

      // Aumentamos el tamaño del canvas según el factor de escala
      canvas.width = img.width * scaleFactor
      canvas.height = img.height * scaleFactor

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Configuramos calidad de renderizado
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      // Dibujamos la imagen escalada (los últimos 4 parámetros son: x, y, width, height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      DOMURL.revokeObjectURL(svgUrl)

      const imgURI = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream")

      const downloadLink = document.createElement("a")
      downloadLink.href = imgURI
      downloadLink.download = `check-in-code-${check_in_code}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
    img.src = svgUrl
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Check-in Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          {check_in_code ? (
            <div className="flex flex-col items-center gap-4">
              <div
                ref={qrCodeRef}
                className="bg-white p-4 rounded-md border border-gray-200"
              >
                <QRCodeReact value={qrValue} size={200} level="H" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-mono">{check_in_code}</p>
                <p className="text-sm text-gray-500">
                  Use this code to check in
                </p>
              </div>
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2"
                variant="outline"
                aria-label="Download QR code"
              >
                <Download className="h-4 w-4" />
                <span>Download QR</span>
              </Button>
            </div>
          ) : (
            <p className="text-lg text-gray-500 text-center">
              No code available
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QRcode
