'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import usePermission from './hooks/usePermission'
import YourPasses from "./Tabs/YourPasses"
import BuyPasses from "./Tabs/BuyPasses"
import { ShoppingCart, Ticket } from "lucide-react"

export default function HomePasses() {
  usePermission()

  return (
    <Tabs defaultValue="buy-passes" className="w-full my-12 md:mt-0 mx-auto items-center max-w-3xl">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="buy-passes"> <ShoppingCart className="w-4 h-4 mr-2" /> Buy Passes</TabsTrigger>
        <TabsTrigger value="your-passes"> <Ticket className="w-4 h-4 mr-2" /> Your Passes</TabsTrigger>
      </TabsList>

      <TabsContent value="buy-passes">
        <BuyPasses/>
      </TabsContent>

      <TabsContent value="your-passes">
        <YourPasses/>
      </TabsContent>

    </Tabs>
  )
}

