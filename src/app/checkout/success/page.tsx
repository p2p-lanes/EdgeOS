"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowLeft, CheckCircle, Download, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import useGetApplications from "@/hooks/useGetApplications"
import { useApplication } from "@/providers/applicationProvider"

const SuccessPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const getApplication = useGetApplications()
  const { getRelevantApplication, applications } = useApplication()
  
  useEffect(() => {
    const fetchApplication = async () => {
      await getApplication()
    }
    fetchApplication()
  }, []);
  
  useEffect(() => {
    if(!applications) return

    console.log('applications', applications)
    const application = getRelevantApplication()
    console.log('application', application)
  }, [applications]);


  const handleDownloadReceipt = () => {
    // Implementation to download the receipt
    // This would be a real function that would generate a PDF or similar
    alert("Receipt download started...")
  }

  const handleGoToPortal = () => {
    router.push("/portal")
  }

  return (
    <div 
      className="min-h-screen w-full py-12 flex items-center justify-center"
      style={{
        backgroundImage: "url('https://simplefi.s3.us-east-2.amazonaws.com/edge-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <motion.div 
        className="container max-w-xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tickets Purchased!</h1>
            <p className="mt-2 text-gray-600">Thank you for your purchase. Your tickets are now ready for use.</p>
          </div>

          {/* <div className="bg-gray-50 rounded-lg p-5 mb-6">
            <h2 className="text-lg font-semibold mb-3 text-gray-800">Order Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{orderDetails.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${orderDetails.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{orderDetails.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{orderDetails.time}</span>
              </div>
            </div>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-1 items-center gap-4">
            {/* <Button 
              onClick={handleDownloadReceipt}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4" />
              Download Invoice
            </Button> */}
            
            <Button 
              onClick={handleGoToPortal}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Home className="h-4 w-4" />
              Go to Portal
            </Button>
          </div>

          {/* <div className="mt-6 pt-6 border-t border-gray-200 flex justify-center">
            <Link 
              href="/"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              tabIndex={0}
              aria-label="Return to homepage"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span>Return to homepage</span>
            </Link>
          </div> */}
        </div>
      </motion.div>
    </div>
  )
}

export default SuccessPage