import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsAttendee } from "./ProductsAttendee"
import { ProductsPass, ProductsProps } from "@/types/Products"
import { AttendeeProps } from "@/types/Attendee"
import { useState } from "react"

interface PassesSidebarProps {
  productsPurchase: ProductsProps[], 
  attendees: AttendeeProps[], 
}


const PassesSidebar = ({productsPurchase, attendees}: PassesSidebarProps) => {
  const [products, setProducts] = useState<ProductsPass[]>(productsPurchase)

  const toggleProduct = (attendee_id: number, product_id: number) => {
    setProducts(prev => prev.map(product => 
      product.id === product_id ? {...product, attendee_id, selected: !product.selected } : product
    ))
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
          <div className="text-center text-muted-foreground py-8">
            No payment history available
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
export default PassesSidebar