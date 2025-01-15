import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsPass, ProductsProps } from "@/types/Products"
import { AttendeeProps } from "@/types/Attendee"
import { useMemo, useState } from "react"
import PaymentHistory from "./Payments/PaymentHistory"
import usePostData from "../../hooks/usePostData"
import { toggleProducts } from "../../helpers/products"
import { defaultProducts } from "../../helpers/filter"
import { PaymentsProps } from "@/types/passes"
import PassesSidebar from "./Passes/PassesSidebar"

interface TabsContainerProps {
  productsPurchase: ProductsProps[], 
  attendees: AttendeeProps[], 
  payments: PaymentsProps[],
  discount: number
}

const TabsContainer = ({productsPurchase, attendees, payments, discount}: TabsContainerProps) => {
  const initialProducts = useMemo(() => defaultProducts(productsPurchase, attendees, discount), [productsPurchase, attendees, discount])
  const [products, setProducts] = useState<ProductsPass[]>(initialProducts)
  const { purchaseProducts, loadingProduct } = usePostData()

  const handleClickPurchase = async () => {
    await purchaseProducts(products)
    setProducts(initialProducts)
  }

  const toggleProduct = (attendee: AttendeeProps | undefined, product?: ProductsPass) => {
    if (!product || !attendee) return;
    setProducts(prev => toggleProducts(prev, product, attendee, initialProducts));
  };

  return (
    <Tabs defaultValue="passes" className="w-full mt-6 md:mt-0">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="passes">Passes</TabsTrigger>
        <TabsTrigger value="payment-history">Payment History</TabsTrigger>
      </TabsList>

      <TabsContent value="passes">
        <PassesSidebar products={products} attendees={attendees} onToggleProduct={toggleProduct} purchaseProducts={handleClickPurchase} loadingProduct={loadingProduct} />
      </TabsContent>

      <TabsContent value="payment-history">
        <PaymentHistory payments={payments}/>
      </TabsContent>
    </Tabs>
  )
}
export default TabsContainer