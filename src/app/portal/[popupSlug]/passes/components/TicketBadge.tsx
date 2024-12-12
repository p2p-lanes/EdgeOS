'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Ticket, GemIcon, BabyIcon, AwardIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface TicketBadgeProps {
  name: string;
  badge: string;
  email: string;
  initialPatronStatus?: boolean;
  onWeekSelect: (name: string, weeks: string[]) => void;
  onPatronStatusChange: (name: string, isPatron: boolean) => void;
  handleClickAction: () => void
}

export default function TicketBadge({ 
  name, 
  badge, 
  email, 
  initialPatronStatus = false,
  onWeekSelect,
  onPatronStatusChange,
  handleClickAction
}: TicketBadgeProps) {
  const [tickets, setTickets] = useState({
    week1: false,
    week2: false,
    week3: false,
    week4: false,
  });
  const [isPatron, setIsPatron] = useState(initialPatronStatus);

  useEffect(() => {
    const selectedWeeks = Object.entries(tickets)
      .filter(([_, isSelected]) => isSelected)
      .map(([weekKey]) => `Week ${weekKey.slice(-1)}`);
    onWeekSelect(name, selectedWeeks);
  }, [tickets, name, onWeekSelect]);

  useEffect(() => {
    onPatronStatusChange(name, isPatron);
  }, [isPatron, name, onPatronStatusChange]);

  const toggleWeek = (week: keyof typeof tickets) => {
    setTickets(prev => ({ ...prev, [week]: !prev[week] }));
  };

  const togglePatronStatus = () => {
    setIsPatron(prev => !prev);
  };

  const getBadgeIcon = (badge: string) => {
    if (badge === "spouse") return <GemIcon className="w-3 h-3 mr-1" />;
    if (badge.startsWith("Children")) return <BabyIcon className="w-3 h-3 mr-1" />;
    return <Users className="w-3 h-3 mr-1" />;
  };

  const calculatePrice = useCallback(() => {
    const selectedWeeksCount = Object.values(tickets).filter(Boolean).length;
    return selectedWeeksCount * 25;
  }, [tickets]);

  const anyTicketSelected = Object.values(tickets).some(Boolean);

  return (
    <Card className="w-full max-w-3xl overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-col mb-3">
            <Badge 
              variant="secondary"
              className={`self-start mb-1 flex items-center cursor-pointer ${
                isPatron ? 'bg-green-600 text-white hover:bg-green-700' : 'hover:bg-gray-100'
              }`}
              onClick={togglePatronStatus}
            >
              <AwardIcon className="w-3 h-3 mr-1" />
              {isPatron ? 'Patron' : 'Become Patron'}
            </Badge>
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
            {(['week1', 'week2', 'week3', 'week4'] as const).map((week, index) => (
              <Badge 
                key={week}
                variant={tickets[week] ? "default" : "outline"}
                className={`flex items-center text-xs cursor-pointer ${
                  tickets[week] 
                    ? "bg-green-600 text-white hover:bg-green-700" 
                    : "hover:bg-gray-100"
                }`}
                onClick={() => toggleWeek(week)}
              >
                <Ticket className="w-3 h-3 mr-1" />
                Week {index + 1}
              </Badge>
            ))}
          </div>
        </div>
        <AnimatePresence>
          {anyTicketSelected && (
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
                  ${calculatePrice().toFixed(2)} total for {Object.values(tickets).filter(Boolean).length} tickets
                </p>
                <Button 
                  variant="default"
                  size="sm" 
                  onClick={handleClickAction}
                  className="w-full sm:w-auto"
                >
                  Complete Purchase
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
