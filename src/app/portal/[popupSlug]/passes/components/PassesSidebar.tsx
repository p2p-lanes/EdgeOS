import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsAttendee } from "./ProductsAttendee"
import { ProductsPass, ProductsProps } from "@/types/Products"
import { AttendeeProps } from "@/types/Attendee"
import { useState } from "react"
import PaymentHistory from "./PaymentHistory"
import { TicketCategoryProps } from "@/types/Application"

interface PassesSidebarProps {
  productsPurchase: ProductsProps[], 
  attendees: AttendeeProps[], 
  payments: any[],
  category: TicketCategoryProps
}

const productsInitail = (productsPurchase: ProductsProps[], attendees: AttendeeProps[], category: TicketCategoryProps) => {
  const mainAttendee = attendees.find(a => a.category === 'main') ?? { id: 0, products: [] }
  const patreonPurchase = mainAttendee?.products?.some(p => p.category === 'patreon')
  const initialProducts = productsPurchase.map(p => {
    if(p.category !== 'patreon'){
      return {
        ...p,
        price: patreonPurchase ? 0 : p.price,
        builder_price: patreonPurchase ? 0 : p.builder_price,
        compare_price: patreonPurchase ? 0 : p.compare_price
      }
    }
    return p
  })

  return initialProducts
}

const PassesSidebar = ({productsPurchase, attendees, payments, category}: PassesSidebarProps) => {
  const initialProducts = productsInitail(productsPurchase, attendees, category)
  const [products, setProducts] = useState<ProductsPass[]>(initialProducts)

  const toggleProduct = (attendee_id: number, product?: ProductsPass) => {
    if (!product) return;

    const isPatreonProduct = product.category === 'patreon';
    const isNewSelection = !product.selected;

    if (isPatreonProduct) {
      if (isNewSelection) {
        setProducts(prev => prev.map(p => ({
          ...p,
          attendee_id: p.id === product.id ? attendee_id : p.attendee_id,
          selected: p.id === product.id ? true : p.selected,
          price: p.id === product.id ? p.price : 0
        })));
        return;
      }
      
      setProducts(productsPurchase);
      return;
    }

    setProducts(prev => prev.map(p => ({
      ...p,
      attendee_id: p.id === product.id ? attendee_id : p.attendee_id,
      selected: p.id === product.id ? !p.selected : p.selected
    })));
  }

  return (
    <div className="mt-6 md:mt-0">
      <Tabs defaultValue="passes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="passes">Passes</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="passes">
          <ProductsAttendee products={products} attendees={attendees} onToggleProduct={toggleProduct} />
        </TabsContent>

        <TabsContent value="payment-history">
          <PaymentHistory payments={payments}/>
        </TabsContent>
      </Tabs>
    </div>
  )
}
export default PassesSidebar