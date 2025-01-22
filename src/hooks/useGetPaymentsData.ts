import { api } from "@/api"
import { useApplication } from "@/providers/applicationProvider"
import { PaymentsProps } from "@/types/passes"
import { useEffect, useState } from "react"

const useGetPaymentsData = () => {
  const [payments, setPayments] = useState<PaymentsProps[]>([])
  const { getRelevantApplication } = useApplication()
  
  const application = getRelevantApplication()
  
  const getPayments = async () => {
    if(!application) return;

    const response = await api.get(`payments?application_id=${application.id}`)

    if(response.status === 200){
      setPayments(response.data)
    }
  }

  useEffect(() => {
    getPayments()
  }, [application])
  
  return {payments}
}
export default useGetPaymentsData