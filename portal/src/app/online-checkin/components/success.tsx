import { format } from "date-fns"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

const success = ({
  arrivalDate,
  departureDate,
}: {
  arrivalDate: Date
  departureDate: Date
}) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg p-6 md:p-8 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.4,
        type: "spring",
        stiffness: 100,
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
      </motion.div>

      <h2 className="text-2xl font-bold mb-2">Online Check-in Successful!</h2>
      <p className="text-gray-600 mb-6">
        Thank you for completing your online check-in for Edge Esmeralda 2025.
        We&apos;ve recorded your arrival and departure dates.
      </p>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500 text-left">Arrival Date:</div>
          <div className="font-medium text-right">
            {arrivalDate ? format(arrivalDate, "PPP") : ""}
          </div>
          <div className="text-gray-500 text-left">Departure Date:</div>
          <div className="font-medium text-right">
            {departureDate ? format(departureDate, "PPP") : ""}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        We look forward to seeing you soon in Healdsburg!
      </p>
    </motion.div>
  )
}
export default success
