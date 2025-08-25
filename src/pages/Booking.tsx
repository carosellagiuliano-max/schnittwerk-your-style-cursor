import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, User, Mail, Phone, Scissors, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Stylist {
  id: string;
  name: string;
  specialties: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
}

interface AvailabilityResponse {
  available: boolean;
  date: string;
  workingHours: {
    open: string;
    close: string;
  };
  stylists: Stylist[];
  services: Service[];
  availableSlots: string[];
}

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedStylist, setSelectedStylist] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);

  const { toast } = useToast();
  const salonId = 'default-salon';

  // Lade Friseure und Services beim Start
  useEffect(() => {
    loadStylists();
    loadServices();
  }, []);

  // Setze Standardwerte nach dem Laden der Daten
  useEffect(() => {
    if (stylists.length > 0 && services.length > 0) {
      // Setze Vanessa Carosella als Standard-Friseurin
      const vanessa = stylists.find(s => s.name.includes('Vanessa') || s.name.includes('Carosella'));
      if (vanessa) {
        setSelectedStylist(vanessa.id);
      }
      
      // Setze "Haare färben" als Standard-Service
      const haareFaerben = services.find(s => 
        s.name.toLowerCase().includes('färben') || 
        s.name.toLowerCase().includes('coloration') ||
        s.name.toLowerCase().includes('farbe')
      );
      if (haareFaerben) {
        setSelectedService(haareFaerben.id);
      }
    }
  }, [stylists, services]);

  // Lade Verfügbarkeit wenn sich das Datum ändert
  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate]);

  // Auto-Close nach Datum-Auswahl
  useEffect(() => {
    if (selectedDate && selectedStylist && selectedService) {
      // Kurze Verzögerung für bessere UX
      const timer = setTimeout(() => {
        // Hier könnte der Dialog geschlossen werden, falls er in einem Dialog ist
        // Für jetzt zeigen wir nur eine Bestätigung
        toast({
          title: "Datum ausgewählt",
          description: `Termin für ${format(selectedDate, "PPP", { locale: de })} ausgewählt.`,
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedDate, selectedStylist, selectedService]);

  const loadStylists = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/salon/${salonId}/stylists`);
      if (response.ok) {
        const data = await response.json();
        setStylists(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Friseure:', error);
    }
  };

  const loadServices = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/salon/${salonId}/services`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Services:', error);
    }
  };

  const loadAvailability = async () => {
    if (!selectedDate) return;
    
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`http://localhost:3001/api/availability/${salonId}/${dateString}`);
      if (response.ok) {
        const data = await response.json();
        setAvailability(data);
        setAvailableSlots(data.availableSlots || []);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Verfügbarkeit:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedStylist || !selectedService || !selectedTime || !customerName || !customerEmail) {
      toast({
        title: "Fehlende Informationen",
        description: "Bitte fülle alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch('http://localhost:3001/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salonId,
          stylistId: selectedStylist,
          serviceId: selectedService,
          customerName,
          customerEmail,
          customerPhone,
          appointmentDate: dateString,
          startTime: selectedTime,
          notes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookingSuccess(true);
        toast({
          title: "Termin erfolgreich gebucht!",
          description: `Dein Termin am ${dateString} um ${selectedTime} wurde bestätigt.`,
        });
        
        // Formular zurücksetzen
        resetForm();
      } else {
        const errorData = await response.json();
        toast({
          title: "Fehler bei der Buchung",
          description: errorData.error || "Ein unbekannter Fehler ist aufgetreten.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verbindungsfehler",
        description: "Bitte überprüfe deine Internetverbindung und versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedStylist('');
    setSelectedService('');
    setSelectedTime('');
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setNotes('');
    setAvailability(null);
    setAvailableSlots([]);
    setIsBookingSuccess(false);
  };

  const getSelectedServicePrice = () => {
    const service = services.find(s => s.id === selectedService);
    return service?.price || 0;
  };

  const getSelectedServiceDuration = () => {
    const service = services.find(s => s.id === selectedService);
    return service?.duration || 0;
  };

  if (isBookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Termin erfolgreich gebucht!</CardTitle>
              <CardDescription>
                Vielen Dank für deine Buchung. Du erhältst in Kürze eine Bestätigung per E-Mail.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={resetForm} className="w-full">
                Neuen Termin buchen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 font-heading">Termin buchen</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Buche deinen Wunschtermin bei unseren erfahrenen Friseuren im Schnittwerk
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Buchungsformular */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <CalendarIcon className="w-6 h-6 text-primary" />
                Termin auswählen
              </CardTitle>
              <CardDescription className="text-base">
                Wähle deinen Wunschtermin und Service aus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Datum */}
                <div className="space-y-2">
                  <Label htmlFor="date">Datum *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: de }) : "Datum auswählen"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        locale={de}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Friseur */}
                <div className="space-y-2">
                  <Label htmlFor="stylist">Friseur *</Label>
                  <Select value={selectedStylist} onValueChange={setSelectedStylist}>
                    <SelectTrigger>
                      <SelectValue placeholder="Friseur auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {stylists.map((stylist) => (
                        <SelectItem key={stylist.id} value={stylist.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{stylist.name}</span>
                            <span className="text-sm text-muted-foreground">{stylist.specialties}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Service */}
                <div className="space-y-2">
                  <Label htmlFor="service">Service *</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Service auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col">
                              <span className="font-medium">{service.name}</span>
                              <span className="text-sm text-muted-foreground">{service.description}</span>
                            </div>
                            <span className="text-sm font-medium text-primary">
                              {service.price.toFixed(2)} €
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Uhrzeit */}
                {selectedDate && availability?.available && (
                  <div className="space-y-2">
                    <Label htmlFor="time">Uhrzeit *</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Uhrzeit auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Kundeninformationen */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Deine Daten
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Dein vollständiger Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="deine.email@beispiel.de"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+49 123 456789"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Anmerkungen (optional)</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Besondere Wünsche oder Anmerkungen"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300" disabled={isLoading}>
                  {isLoading ? "Buche Termin..." : "Termin buchen"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Zusammenfassung */}
          <div className="space-y-8">
            {/* Verfügbarkeit */}
            {selectedDate && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                    Verfügbarkeit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {availability?.available ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-muted-foreground">Öffnungszeiten:</span>
                        <span className="font-semibold text-gray-900">
                          {availability.workingHours.open} - {availability.workingHours.close}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-muted-foreground">Verfügbare Zeiten:</span>
                        <span className="font-semibold text-gray-900">{availableSlots.length}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">An diesem Tag geschlossen</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Service-Details */}
            {selectedService && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Scissors className="w-6 h-6 text-green-600" />
                    Service-Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-muted-foreground">Service:</span>
                      <span className="font-semibold text-gray-900">
                        {services.find(s => s.id === selectedService)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-muted-foreground">Dauer:</span>
                      <span className="font-semibold text-gray-900">{getSelectedServiceDuration()} Min.</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-muted-foreground">Preis:</span>
                      <span className="text-2xl font-bold text-primary">
                        {getSelectedServicePrice().toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informationen */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                <CardTitle className="text-xl">Wichtige Informationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Bitte sei 10 Minuten vor deinem Termin da</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Bei Verspätung kann der Termin nicht garantiert werden</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Stornierungen bitte spätestens 24h vorher</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Bei Fragen: +41 78 850 85 95</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
