'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Ticket, GemIcon, BabyIcon, AwardIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Button, ButtonAnimated } from '@/components/ui/button';

interface TicketBadgeProps {
  name: string;
  badge: string;
  email: string;
  initialPatronStatus?: boolean;
  handleClickAction: (ticket: any) => void,
  products: any,
  loading: boolean
}

export default function TicketBadge({ 
  name, 
  badge, 
  email,
  handleClickAction,
  products,
  loading
}: TicketBadgeProps) {
  const [tickets, setTickets] = useState(products);

  const toggleProduct = (product: any) => {
    setTickets((prev: any) => 
            prev.map((ticket: any) => 
                ticket.id === product.id ? { ...ticket, enabled: !ticket.enabled } : ticket
            )
        );
  };

  const getBadgeIcon = (badge: string) => {
    if (badge === "spouse") return <GemIcon className="w-3 h-3 mr-1" />;
    if (badge.startsWith("Children")) return <BabyIcon className="w-3 h-3 mr-1" />;
    return <Users className="w-3 h-3 mr-1" />;
  };

  const calculatePrice = useCallback(() => {
    const selectedWeeksCount = tickets.reduce((total: number, ticket: any) => {
        if (ticket.enabled) {
            return total + ticket.price;
        }
        return total;
    }, 0);
    return selectedWeeksCount;
  }, [tickets]);

  const ticketsEnabled = tickets.filter((ticket: any) => ticket.enabled)

  return (
    <Card className="w-full max-w-3xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-col mb-3">
            {
              tickets.map((ticket: any) => {
                if(ticket.category === 'patreon'){
                  return(
                    <Badge 
                      key={ticket.name + ticket.id}
                      variant="secondary"
                      className={`self-start mb-1 flex items-center cursor-pointer ${
                        ticket.enabled ? 'bg-green-600 text-white hover:bg-green-700' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => toggleProduct(ticket)}
                    >
                      <AwardIcon className="w-3 h-3 mr-1" />
                      {ticket.enabled ? 'Patron' : 'Become Patron'}
                    </Badge>
                  )
                }
              })
            }
            <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
            <span className="text-xs text-gray-500">{email}</span>
          </div>
          <Badge variant="secondary" className="flex items-center">
            {getBadgeIcon(badge)}
            {badge}
          </Badge>
        </div>
        <div className="border-t pt-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Tickets</h3>
          <div className="flex flex-wrap gap-2">
            {tickets.map((ticket: any, index: number) => {
              if(ticket.category === 'week'){
                return(
                  <Badge 
                    key={`week${index}`}
                    variant={ticket.enabled ? "default" : "outline"}
                    className={`flex items-center text-xs cursor-pointer ${
                      ticket.enabled
                        ? "bg-green-600 text-white hover:bg-green-700" 
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => toggleProduct(ticket)}
                  >
                    <Ticket className="w-3 h-3 mr-1" />
                    {ticket.name}
                  </Badge>
                )
              }
            })}
          </div>
        </div>
        <AnimatePresence>
          {ticketsEnabled.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 16 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 16 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden -mx-4 -mb-4"
            >
              <motion.div 
                className="border-t mt-3 bg-[#FAFAFA] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                exit={{ y: 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <p className="text-sm text-muted-foreground mb-2 sm:mb-0">
                  ${calculatePrice().toFixed(2)} total for {ticketsEnabled.length} tickets
                </p>
                <ButtonAnimated
                  loading={loading}
                  variant="default"
                  onClick={() => handleClickAction(tickets)}
                  className="w-full sm:w-auto"
                >
                  Complete Purchase
                </ButtonAnimated>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
