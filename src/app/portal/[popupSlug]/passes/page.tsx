'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import usePermission from './hooks/usePermission'
import YourPasses from "./Tabs/YourPasses"
import BuyPasses from "./Tabs/BuyPasses"
import { ShoppingCart, Ticket } from "lucide-react"
import { usePassesProvider } from "@/providers/passesProvider"
import { Loader } from "@/components/ui/Loader"
import { useState } from "react"

export default function HomePasses() {
  usePermission()

  const { attendeePasses: attendees, products } = usePassesProvider()
  const [activeTab, setActiveTab] = useState<string>("your-passes");

  if(!attendees.length || !products.length) return <Loader />

  const someProductPurchased = attendees.some(a => a.products.some(p => p.purchased))

  const initialTab = activeTab || (someProductPurchased ? "your-passes" : "buy-passes");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <Tabs value={initialTab} onValueChange={handleTabChange} className="w-full md:mt-0 mx-auto items-center max-w-5xl p-6" data-testid="passes-tabs">
      <TabsList className="grid w-full grid-cols-2 mb-4" data-testid="passes-tabs-list">
        <TabsTrigger value="your-passes" data-testid="your-passes-tab"> <Ticket className="w-4 h-4 mr-2" /> Your Passes</TabsTrigger>
        <TabsTrigger value="buy-passes" data-testid="buy-passes-tab"> <ShoppingCart className="w-4 h-4 mr-2" /> Buy Passes</TabsTrigger>
      </TabsList>

      <TabsContent value="your-passes" data-testid="your-passes-content">
        <YourPasses onSwitchToBuy={() => handleTabChange("buy-passes")} />
      </TabsContent>

      <TabsContent value="buy-passes" data-testid="buy-passes-content">
        <BuyPasses viewInvoices={false}/>
      </TabsContent>
    </Tabs>
  )
}

