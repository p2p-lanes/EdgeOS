import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Pencil, Ticket, Trash2, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { AttendeeProps } from "@/types/Attendee"
import { badgeName } from "../../constants/multiuse"

interface AttendeeCardProps {
  attendee: AttendeeProps;
  onDelete?: () => void
  onClickEdit?: () => void
  loading: boolean;
}

export function AttendeeCard({loading, attendee, onDelete, onClickEdit }: AttendeeCardProps) {
  const { email, name, category } = attendee
  const initials = name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()

  const isSpouse = category === "spouse";
  const hasProducts = attendee.products && attendee.products.length > 0

  return (
    <Card className="p-4 space-y-3">
      <div className="flex justify-between items-center mb-3">
        <Badge variant="secondary" className="w-fit gap-2">
          <User className="h-4 w-4"/>
          {badgeName[category] || category}
        </Badge>
        <div className="flex items-center gap-2">
          {
            onClickEdit && (
              <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClickEdit}
              disabled={loading}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )
        }
        {(isSpouse && onDelete) && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDelete}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
        <div className="flex items-center gap-3 mb-2 sm:mb-0">
          <Avatar className="h-10 w-10 bg-muted">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-bold leading-none">{name}</h3>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {hasProducts ? <>
            <p className="text-xs font-semibold text-muted-foreground">Purchased passes</p>
            <div className="grid grid-cols-2 ">
              {attendee.products?.map((p) => (
                  <Badge
                    key={p.id}
                    variant="outline" 
                    className={'w-fit bg-[#0F172A] text-white gap-1'}
                  >
                    <Ticket className="h-4 w-4" />
                    <div className="flex flex-col">
                      <p className="text-xs font-semibold text-white">{p.name}</p>
                      <p className="text-xs font-semibold text-white">{p.start_date && p.end_date ? `${new Date(p.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${new Date(p.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</p>
                    </div>
                  </Badge>
              ))}
            </div>
          </> : (
            <p className="text-xs font-semibold text-muted-foreground">No purchased passes yet</p>
          )}
        </div>
      </div>
    </Card>
  )
}

