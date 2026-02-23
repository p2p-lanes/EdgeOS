"use client"
import { ShoppingCart, Ticket } from "lucide-react"
import { useState } from "react"
import { Loader } from "@/components/ui/Loader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePassesProvider } from "@/providers/passesProvider"
import usePermission from "./hooks/usePermission"
import BuyPasses from "./Tabs/BuyPasses"
import YourPasses from "./Tabs/YourPasses"

export default function HomePasses() {
  usePermission()

  const { attendeePasses: attendees, products } = usePassesProvider()
  const [activeTab, setActiveTab] = useState<string | null>(null)

  if (!attendees.length || !products.length) return <Loader />

  const someProductPurchased = attendees.some((a) =>
    a.products.some((p) => p.purchased),
  )

  const initialTab =
    activeTab || (someProductPurchased ? "your-passes" : "buy-passes")

  console.log({ someProductPurchased, initialTab })

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <Tabs
      value={initialTab}
      onValueChange={handleTabChange}
      className="w-full md:mt-0 mx-auto items-center max-w-5xl p-6"
    >
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="your-passes">
          {" "}
          <Ticket className="w-4 h-4 mr-2" /> Your Passes
        </TabsTrigger>
        <TabsTrigger value="buy-passes">
          {" "}
          <ShoppingCart className="w-4 h-4 mr-2" /> Buy Passes
        </TabsTrigger>
      </TabsList>

      <TabsContent value="your-passes">
        <YourPasses onSwitchToBuy={() => handleTabChange("buy-passes")} />
      </TabsContent>

      <TabsContent value="buy-passes">
        <BuyPasses viewInvoices={false} />
      </TabsContent>
    </Tabs>
  )
}
