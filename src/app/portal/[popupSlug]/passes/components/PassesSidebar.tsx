import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductsAttendee } from "./ProductsAttendee"
import { ProductsPass, ProductsProps } from "@/types/Products"
import { AttendeeProps } from "@/types/Attendee"
import { useMemo, useState } from "react"
import PaymentHistory from "./PaymentHistory"
import usePostData from "../hooks/usePostData"
import { toggleProducts } from "../helpers/products"

interface PassesSidebarProps {
  productsPurchase: ProductsProps[], 
  attendees: AttendeeProps[], 
  payments: any[],
  discount: number
}

const defaultProducts = (products: ProductsProps[], attendees: AttendeeProps[], discount: number): ProductsPass[] => {
  const mainAttendee = attendees.find(a => a.category === 'main') ?? { id: 0, products: [] }

  const hasDiscount = discount > 0
  const isPatreon = mainAttendee.products?.some(p => p.category === 'patreon')

  return products.map(p => {
    if(p.category !== 'patreon' && p.category !== 'supporter'){
      return {
        ...p,
        price: isPatreon ? 0 : hasDiscount ? p.price * (1 - discount/100) : p.price,
        original_price: hasDiscount ? p.price : p.compare_price, // Precio original para mostrar tachado
      }
    }
    return {...p, original_price: p.price}
  }) as ProductsPass[]
}

const PassesSidebar = ({productsPurchase, attendees, payments, discount}: PassesSidebarProps) => {
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
    <div className="mt-6 md:mt-0">
      <Tabs defaultValue="passes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="passes">Passes</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="passes">
          <ProductsAttendee products={products} attendees={attendees} onToggleProduct={toggleProduct} purchaseProducts={handleClickPurchase} loadingProduct={loadingProduct} />
        </TabsContent>

        <TabsContent value="payment-history">
          <PaymentHistory payments={payments}/>
        </TabsContent>
      </Tabs>
    </div>
  )
}
export default PassesSidebar