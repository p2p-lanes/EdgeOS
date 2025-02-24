'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import usePermission from './hooks/usePermission'
import YourPasses from "./Tabs/YourPasses"
import BuyPasses from "./Tabs/BuyPasses"
import { ShoppingCart, Ticket } from "lucide-react"
import { usePassesProvider } from "@/providers/passesProvider"
import { Loader } from "@/components/ui/Loader"

export default function HomePasses() {
  usePermission()

  const { attendeePasses: attendees, products } = usePassesProvider()

  if(!attendees.length || !products.length) return <Loader />

  const someProductPurchased = attendees.some(a => a.products.some(p => p.purchased))

  return (
    <Tabs defaultValue={someProductPurchased ? "your-passes" : "buy-passes"} className="w-full my-12 md:mt-0 mx-auto items-center max-w-3xl">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="your-passes"> <Ticket className="w-4 h-4 mr-2" /> Your Passes</TabsTrigger>
        <TabsTrigger value="buy-passes"> <ShoppingCart className="w-4 h-4 mr-2" /> Buy Passes</TabsTrigger>
      </TabsList>

      <TabsContent value="your-passes">
        <YourPasses/>
      </TabsContent>

      <TabsContent value="buy-passes">
        <BuyPasses/>
      </TabsContent>
    </Tabs>
  )
}

