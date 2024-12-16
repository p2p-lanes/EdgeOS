'use client'

import { useState, useEffect } from 'react'
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
  const { products, payments } = useGetData()
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
      window.location.href = `${purchase.checkout_url}?redirect_url=${window.location.href}`
    }
  }

  const productsPayments = () => {
    const productPatreon = products.find(p => p.category === 'patreon')
    const paymentAprroved = payments.find(p => p.status === 'approved')
    if(productPatreon && paymentAprroved && paymentAprroved.products.includes(productPatreon.id)){
      return products.map((product: any) => ({...product, purchased: true}))
    }else{
      return products.map((product: any) => {
        const payment = payments.find((payment: any) => payment.status === 'approved' && payment.products.includes(product.id));
        return payment ? { ...product, purchased: true } : product;
      })
    }
  }

  if(!application || !products || !payments || products.length === 0) return <Loader/>

  const name = application.first_name + ' ' + application.last_name

  return (
    <div className="container mx-auto p-4 lg:flex">
      <div className="flex-grow mb-4 lg:mb-0">
        <div className="space-y-4">
          <TicketBadge 
            products={productsPayments()}
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

