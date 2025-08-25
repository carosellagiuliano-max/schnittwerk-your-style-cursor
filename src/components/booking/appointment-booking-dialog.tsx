import React, { useState } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { CalendarIcon, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

// Using existing team owner image for Vanessa
import vanessaLogo from '@/assets/team-owner.jpg'

interface AppointmentBookingDialogProps {
  children: React.ReactNode
}

const timeSlots = [
  '09:00','09:30','10:00','10:30','11:00','11:30',
  '12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00'
]

const hairdressers = [
  {
    id: 'vanessa',
    name: 'Vanessa (Inhaberin)',
    specialty: 'Schnitt & Farbe',
    image: vanessaLogo,
    description:
      'Erfahrene Friseurin mit über 10 Jahren Berufserfahrung. Spezialisiert auf moderne Schnitte und Farbbehandlungen.'
  }
]

const services = [
  { id: 'cut', name: 'Haarschnitt', duration: '60 min', price: 'ab CHF 45' },
  { id: 'color', name: 'Färben', duration: '120 min', price: 'ab CHF 85' },
  { id: 'highlights', name: 'Strähnen', duration: '150 min', price: 'ab CHF 120' },
  { id: 'wash-blow', name: 'Waschen & Föhnen', duration: '45 min', price: 'ab CHF 35' },
  { id: 'treatment', name: 'Haarkur', duration: '30 min', price: 'ab CHF 25' }
]

export function AppointmentBookingDialog({
  children
}: AppointmentBookingDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [selectedHairdresser, setSelectedHairdresser] = useState<string>()
  const [selectedService, setSelectedService] = useState<string>()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) setCalendarOpen(false)
  }

  const handleBooking = () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !selectedHairdresser ||
      !selectedService
    ) {
      toast({
        title: 'Bitte alle Felder ausfüllen',
        description: 'Datum, Zeit, Friseur und Behandlung müssen ausgewählt werden.',
        variant: 'destructive'
      })
      return
    }

    const bookingDetails = {
      date: format(selectedDate, 'dd.MM.yyyy'),
      time: selectedTime,
      hairdresser:
        hairdressers.find(h => h.id === selectedHairdresser)?.name ?? '',
      service:
        services.find(s => s.id === selectedService)?.name ?? ''
    }

    toast({
      title: 'Termin angefragt',
      description: `Ihr Termin am ${bookingDetails.date} um ${bookingDetails.time} bei ${bookingDetails.hairdresser} wurde angefragt.`
    })

    // Reset
    setSelectedDate(undefined)
    setSelectedTime(undefined)
    setSelectedHairdresser(undefined)
    setSelectedService(undefined)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Termin buchen</DialogTitle>
          <DialogDescription>
            Wählen Sie Friseur, Behandlung, Datum und Uhrzeit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Behandlung */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Behandlung</label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Behandlung wählen" />
              </SelectTrigger>
              <SelectContent>
                {services.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex flex-col">
                      <span>{s.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {s.duration} • {s.price}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Datum */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Datum</label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                  onClick={() => setCalendarOpen(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, 'dd.MM.yyyy', { locale: de })
                    : 'Datum wählen'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={date => date < new Date() || date.getDay() === 0}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Uhrzeit */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Uhrzeit</label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger>
                <Clock className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Zeit wählen" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map(time => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Friseur/Stylist */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Friseur/Stylist</label>
            <Select
              value={selectedHairdresser}
              onValueChange={setSelectedHairdresser}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <img
                    src={
                      selectedHairdresser
                        ? hairdressers.find(h => h.id === selectedHairdresser)
                            ?.image
                        : hairdressers[0].image
                    }
                    alt={
                      selectedHairdresser
                        ? hairdressers.find(h => h.id === selectedHairdresser)
                            ?.name
                        : hairdressers[0].name
                    }
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  {selectedHairdresser ? (
                    <span>
                      {
                        hairdressers.find(h => h.id === selectedHairdresser)
                          ?.name
                      }
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Friseur wählen
                    </span>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
                {hairdressers.map(h => (
                  <SelectItem key={h.id} value={h.id}>
                    <div className="flex items-center gap-2">
                      <img
                        src={h.image}
                        alt={h.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <div className="flex flex-col">
                        <span>{h.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {h.specialty}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2">
            <Button
              className="w-full"
              disabled={
                !selectedDate ||
                !selectedTime ||
                !selectedHairdresser ||
                !selectedService
              }
              onClick={handleBooking}
            >
              Termin anfragen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}