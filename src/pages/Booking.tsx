import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, User, Mail, Phone, Scissors, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
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
  const [currentStep, setCurrentStep] = useState(1);
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
      
      // Setze "Coloration Vollfarbe" als Standard-Service
      const coloration = services.find(s => 
        s.name.toLowerCase().includes('coloration') || 
        s.name.toLowerCase().includes('vollfarbe')
      );
      if (coloration) {
        setSelectedService(coloration.id);
      }
    }
  }, [stylists, services]);

  // Lade Verfügbarkeit wenn sich das Datum ändert
  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate]);

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
    setCurrentStep(1);
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

  const getSelectedServiceName = () => {
    const service = services.find(s => s.id === selectedService);
    return service?.name || '';
  };

  const getSelectedStylistName = () => {
    const stylist = stylists.find(s => s.id === selectedStylist);
    return stylist?.name || '';
  };

  const nextStep = () => {
    if (currentStep === 1 && selectedService) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedDate) {
      setCurrentStep(3);
    } else if (currentStep === 3 && selectedTime) {
      setCurrentStep(4);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isBookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl text-green-600 font-heading">Termin erfolgreich gebucht!</CardTitle>
              <CardDescription className="text-lg">
                Vielen Dank für deine Buchung. Du erhältst in Kürze eine Bestätigung per E-Mail.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={resetForm} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg">
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 font-heading">Termin buchen</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Buche deinen Wunschtermin bei unseren erfahrenen Friseuren im Schnittwerk
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("flex items-center", currentStep >= 1 ? "text-primary" : "text-gray-400")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mr-2", currentStep >= 1 ? "bg-primary text-white" : "bg-gray-200")}>
                1
              </div>
              <span className="font-medium">Dienstleistung</span>
            </div>
            <div className={cn("flex items-center", currentStep >= 2 ? "text-primary" : "text-gray-400")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mr-2", currentStep >= 2 ? "bg-primary text-white" : "bg-gray-200")}>
                2
              </div>
              <span className="font-medium">Datum</span>
            </div>
            <div className={cn("flex items-center", currentStep >= 3 ? "text-primary" : "text-gray-400")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mr-2", currentStep >= 3 ? "bg-primary text-white" : "bg-gray-200")}>
                3
              </div>
              <span className="font-medium">Uhrzeit</span>
            </div>
            <div className={cn("flex items-center", currentStep >= 4 ? "text-primary" : "text-gray-400")}>
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center mr-2", currentStep >= 4 ? "bg-primary text-white" : "bg-gray-200")}>
                4
              </div>
              <span className="font-medium">Daten</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / 4) * 100}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hauptformular */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Scissors className="w-6 h-6 text-primary" />
                  {currentStep === 1 && "Dienstleistung auswählen"}
                  {currentStep === 2 && "Datum auswählen"}
                  {currentStep === 3 && "Uhrzeit auswählen"}
                  {currentStep === 4 && "Deine Daten"}
                </CardTitle>
                <CardDescription className="text-base">
                  {currentStep === 1 && "Wähle deine gewünschte Dienstleistung aus"}
                  {currentStep === 2 && "Wähle deinen Wunschtermin aus"}
                  {currentStep === 3 && "Wähle deine Wunschuhrzeit aus"}
                  {currentStep === 4 && "Fülle deine Kontaktdaten aus"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Schritt 1: Dienstleistung auswählen */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label htmlFor="service" className="text-lg font-semibold">Dienstleistung *</Label>
                        <Select value={selectedService} onValueChange={setSelectedService}>
                          <SelectTrigger className="h-14 text-lg">
                            <SelectValue placeholder="Dienstleistung auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                <div className="flex justify-between items-center w-full py-2">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-lg">{service.name}</span>
                                    <span className="text-sm text-muted-foreground">{service.description}</span>
                                    <span className="text-xs text-primary font-medium">{service.category}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-lg font-bold text-primary">
                                      CHF {service.price.toFixed(0)}
                                    </span>
                                    <div className="text-sm text-muted-foreground">{service.duration} Min.</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedService && (
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                          <h3 className="font-semibold text-primary mb-2">Ausgewählte Dienstleistung:</h3>
                          <p className="text-lg font-medium">{getSelectedServiceName()}</p>
                          <p className="text-muted-foreground">Dauer: {getSelectedServiceDuration()} Minuten | Preis: CHF {getSelectedServicePrice().toFixed(0)}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Schritt 2: Datum auswählen */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label htmlFor="date" className="text-lg font-semibold">Datum *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-14 justify-start text-left font-normal text-lg",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-3 h-5 w-5" />
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
                      
                      {selectedDate && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h3 className="font-semibold text-blue-800 mb-2">Ausgewähltes Datum:</h3>
                          <p className="text-lg font-medium text-blue-900">{format(selectedDate, "PPP", { locale: de })}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Schritt 3: Uhrzeit auswählen */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label htmlFor="time" className="text-lg font-semibold">Uhrzeit *</Label>
                        {selectedDate && availability?.available ? (
                          <Select value={selectedTime} onValueChange={setSelectedTime}>
                            <SelectTrigger className="h-14 text-lg">
                              <SelectValue placeholder="Uhrzeit auswählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  <div className="flex items-center justify-between py-2">
                                    <span className="text-lg font-medium">{time}</span>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            {!selectedDate ? "Bitte wähle zuerst ein Datum aus" : "An diesem Tag sind leider keine Termine verfügbar"}
                          </div>
                        )}
                      </div>
                      
                      {selectedTime && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h3 className="font-semibold text-green-800 mb-2">Ausgewählte Uhrzeit:</h3>
                          <p className="text-lg font-medium text-green-900">{selectedTime}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Schritt 4: Kundeninformationen */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-3 mb-6">
                          <User className="w-6 h-6 text-primary" />
                          Deine Kontaktdaten
                        </h3>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name" className="text-base font-medium">Vollständiger Name *</Label>
                            <Input
                              id="name"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Dein vollständiger Name"
                              className="h-12 text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="email" className="text-base font-medium">E-Mail-Adresse *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="deine.email@beispiel.ch"
                              className="h-12 text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="phone" className="text-base font-medium">Telefonnummer (optional)</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="+41 78 123 45 67"
                              className="h-12 text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor="notes" className="text-base font-medium">Anmerkungen (optional)</Label>
                            <Input
                              id="notes"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Besondere Wünsche oder Anmerkungen"
                              className="h-12 text-base"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="flex items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Zurück
                      </Button>
                    )}
                    
                    {currentStep < 4 ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={
                          (currentStep === 1 && !selectedService) ||
                          (currentStep === 2 && !selectedDate) ||
                          (currentStep === 3 && !selectedTime)
                        }
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                      >
                        Weiter
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={isLoading}
                      >
                        {isLoading ? "Buche Termin..." : "Termin buchen"}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Zusammenfassung */}
          <div className="space-y-6">
            {/* Buchungsübersicht */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="text-xl">Buchungsübersicht</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedService && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">Dienstleistung:</span>
                    <span className="font-semibold text-gray-900">{getSelectedServiceName()}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">Datum:</span>
                    <span className="font-semibold text-gray-900">{format(selectedDate, "dd.MM.yyyy", { locale: de })}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-muted-foreground">Uhrzeit:</span>
                    <span className="font-semibold text-gray-900">{selectedTime}</span>
                  </div>
                )}
                {selectedService && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Preis:</span>
                    <span className="text-xl font-bold text-primary">CHF {getSelectedServicePrice().toFixed(0)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informationen */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
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
