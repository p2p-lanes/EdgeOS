import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PaymentHistory from "./Payments/PaymentHistory"
import PassesSidebar from "./Passes/PassesSidebar"

const TabsContainer = () => {
  return (
    <Tabs defaultValue="passes" className="w-full mt-6 md:mt-0">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="passes">Passes</TabsTrigger>
        <TabsTrigger value="payment-history">Payment History</TabsTrigger>
      </TabsList>

      <TabsContent value="passes">
        <PassesSidebar/>
      </TabsContent>

      <TabsContent value="payment-history">
        <PaymentHistory/>
      </TabsContent>
    </Tabs>
  )
}

export default TabsContainer