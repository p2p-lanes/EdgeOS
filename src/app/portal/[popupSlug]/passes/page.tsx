'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import TicketBadge from './components/TicketBadge'
import { useCityProvider } from '@/providers/cityProvider'
import { useRouter } from 'next/navigation'
import { Loader } from '@/components/ui/Loader'
import useGetData from './hooks/useGetData'
import usePostData from './hooks/usePostData'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const { getRelevantApplication } = useCityProvider()
  const application = getRelevantApplication()
  const router = useRouter()
  const { products } = useGetData()
  const { purchaseProducts } = usePostData()

  useEffect(() => {
    if(!application) return;

    if(application.status !== 'accepted'){
      router.replace('./')
      return;
    }
  }, [application])

  const handleClickAction = async (tickets: any) => {
    setLoading(true)
    const purchase = await purchaseProducts(tickets)

    if(purchase){
      setLoading(false)
      window.location.href = purchase.checkout_url
    }
  }

  if(!application || !products) return <Loader/>

  const name = application.first_name + ' ' + application.last_name

  return (
    <div className="container mx-auto p-4 lg:flex">
      <div className="flex-grow mb-4 lg:mb-0">
        <div className="space-y-4">
          <TicketBadge 
            products={products}
            name={name}
            badge="group lead" 
            email={application.email ?? ''}
            handleClickAction={handleClickAction}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

