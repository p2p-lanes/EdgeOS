'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import usePermission from './hooks/usePermission'
import YourPasses from "./Tabs/YourPasses"
import BuyPasses from "./Tabs/BuyPasses"
import { ShoppingCart, Ticket } from "lucide-react"

export default function HomePasses() {
  usePermission()

  return (
    <Tabs defaultValue="your-passes" className="w-full mt-6 md:mt-0 mx-auto max-w-3xl">
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

