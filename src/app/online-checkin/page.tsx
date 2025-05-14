import Image from "next/image"
import { CheckInForm } from "./components/checkinForm"

const page = () => {
  return (
    <div className="flex items-center justify-center p-4 h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image src="https://simplefi.s3.us-east-2.amazonaws.com/checkin-background.png" alt="Edge Esmeralda background" fill priority className="object-cover" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-xl">
        <CheckInForm />
      </div>
    </div>
  )
}
export default page