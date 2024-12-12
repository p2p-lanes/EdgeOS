import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AwardIcon, Ticket, X } from 'lucide-react'

interface CartSidebar {
  selectedWeeks: { [key: string]: string[] }
  patronStatus: { [key: string]: boolean }
}

export function CartSidebar({ selectedWeeks, patronStatus }: CartSidebar) {
  const totalWeeks = Object.values(selectedWeeks).reduce((acc, weeks) => acc + (weeks?.length || 0), 0)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%", x: 0 }}
        animate={{ y: 0, x: 0 }}
        exit={{ y: "100%", x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 lg:static lg:bottom-auto lg:left-auto lg:right-auto"
      >
        <Card className="w-full lg:w-64 h-[80vh] lg:h-full overflow-auto rounded-b-none lg:rounded-b-lg">
          <CardHeader className="sticky top-0 bg-background z-10">
            <div className="flex justify-between items-center">
              <CardTitle>Selected Weeks</CardTitle>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {Object.entries(selectedWeeks).map(([name, weeks]) => (
                weeks && weeks.length > 0 ? (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{name}</h3>
                      {patronStatus[name] && (
                        <Badge className="bg-green-600 text-white">
                          <AwardIcon className="w-3 h-3 mr-1" />
                          Patron
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {weeks.map((week) => (
                          <motion.div
                            key={week}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge 
                              variant="default"
                              className="flex items-center text-xs bg-green-600 text-white"
                            >
                              <Ticket className="w-3 h-3 mr-1" />
                              {week}
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : null
              ))}
            </AnimatePresence>
          </CardContent>
          {totalWeeks > 0 && (
            <CardFooter className="sticky bottom-0 bg-background z-10">
              <Button className="w-full">
                Buy {totalWeeks} {totalWeeks === 1 ? 'Ticket' : 'Tickets'}
              </Button>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

