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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 py-12 px-4 relative overflow-hidden">
        {/* Hintergrund-Dekoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <Card className="text-center shadow-2xl border-0 bg-white/80 backdrop-blur-xl backdrop-saturate-150">
            <CardHeader className="p-12">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-pulse">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <CardTitle className="text-4xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-heading mb-4">
                Termin erfolgreich gebucht!
              </CardTitle>
              <CardDescription className="text-xl text-gray-600 leading-relaxed">
                🎉 Vielen Dank für deine Buchung. Du erhältst in Kürze eine Bestätigung per E-Mail.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-12">
              <Button 
                onClick={resetForm} 
                className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                ✨ Neuen Termin buchen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-blue-50 py-12 px-4 relative overflow-hidden">
      {/* Hintergrund-Dekoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header mit verbessertem Design */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-8 shadow-2xl">
            <Scissors className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-8 font-heading drop-shadow-sm">
            Termin buchen
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Buche deinen Wunschtermin bei unseren erfahrenen Friseuren im Schnittwerk
          </p>
        </div>

        {/* Verbesserte Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            {[
              { step: 1, label: "Dienstleistung", icon: Scissors },
              { step: 2, label: "Datum", icon: CalendarIcon },
              { step: 3, label: "Uhrzeit", icon: Clock },
              { step: 4, label: "Daten", icon: User }
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className={cn("flex items-center transition-all duration-300", 
                currentStep >= step ? "text-purple-600" : "text-gray-400"
              )}>
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mr-3 transition-all duration-300 shadow-lg", 
                  currentStep >= step 
                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-purple-500/25" 
                    : "bg-gray-200 text-gray-400"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-semibold text-lg">{label}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg" 
                 style={{ width: `${(currentStep / 4) * 100}%` }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Hauptformular mit verbessertem Design */}
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl backdrop-saturate-150">
              <CardHeader className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border-b border-purple-100/50 p-8">
                <CardTitle className="flex items-center gap-4 text-3xl text-gray-800">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Scissors className="w-6 h-6 text-white" />
                  </div>
                  {currentStep === 1 && "Dienstleistung auswählen"}
                  {currentStep === 2 && "Datum auswählen"}
                  {currentStep === 3 && "Uhrzeit auswählen"}
                  {currentStep === 4 && "Deine Daten"}
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-2">
                  {currentStep === 1 && "Wähle deine gewünschte Dienstleistung aus unserem umfangreichen Angebot"}
                  {currentStep === 2 && "Wähle deinen Wunschtermin aus dem verfügbaren Kalender"}
                  {currentStep === 3 && "Wähle deine Wunschuhrzeit aus den freien Zeiten"}
                  {currentStep === 4 && "Fülle deine Kontaktdaten für die Terminbestätigung aus"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Schritt 1: Dienstleistung auswählen */}
                  {currentStep === 1 && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label htmlFor="service" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>
                          Dienstleistung *
                        </Label>
                        <Select value={selectedService} onValueChange={setSelectedService}>
                          <SelectTrigger className="h-16 text-lg border-2 border-purple-200 hover:border-purple-300 focus:border-purple-500 transition-all duration-200 shadow-lg hover:shadow-xl">
                            <SelectValue placeholder="Dienstleistung auswählen" />
                          </SelectTrigger>
                          <SelectContent className="border-0 shadow-2xl">
                            {services.map((service) => (
                              <SelectItem key={service.id} value={service.id} className="hover:bg-purple-50 transition-colors">
                                <div className="flex justify-between items-center w-full py-3 px-2">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-lg text-gray-800">{service.name}</span>
                                    <span className="text-sm text-gray-600 mt-1">{service.description}</span>
                                    <span className="text-xs text-purple-600 font-semibold mt-1 bg-purple-100 px-2 py-1 rounded-full inline-block">{service.category}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                      CHF {service.price.toFixed(0)}
                                    </span>
                                    <div className="text-sm text-gray-500 mt-1">{service.duration} Min.</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {selectedService && (
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 shadow-lg transform hover:scale-105 transition-all duration-300">
                          <h3 className="font-bold text-purple-800 mb-3 text-lg">✨ Ausgewählte Dienstleistung:</h3>
                          <p className="text-xl font-semibold text-gray-800 mb-2">{getSelectedServiceName()}</p>
                          <p className="text-gray-600">⏱️ Dauer: {getSelectedServiceDuration()} Minuten | 💰 Preis: CHF {getSelectedServicePrice().toFixed(0)}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Schritt 2: Datum auswählen */}
                  {currentStep === 2 && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label htmlFor="date" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full"></div>
                          Datum *
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-16 justify-start text-left font-normal text-lg border-2 border-blue-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl",
                                !selectedDate && "text-gray-500"
                              )}
                            >
                              <CalendarIcon className="mr-4 h-6 w-6 text-blue-500" />
                              {selectedDate ? format(selectedDate, "PPP", { locale: de }) : "Datum auswählen"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 border-0 shadow-2xl">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                              disabled={(date) => date < new Date() || date.getDay() === 0}
                              locale={de}
                              className="rounded-lg"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      {selectedDate && (
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 shadow-lg transform hover:scale-105 transition-all duration-300">
                          <h3 className="font-bold text-blue-800 mb-3 text-lg">📅 Ausgewähltes Datum:</h3>
                          <p className="text-xl font-semibold text-blue-900">{format(selectedDate, "PPP", { locale: de })}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Schritt 3: Uhrzeit auswählen */}
                  {currentStep === 3 && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label htmlFor="time" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full"></div>
                          Uhrzeit *
                        </Label>
                        {selectedDate && availability?.available ? (
                          <Select value={selectedTime} onValueChange={setSelectedTime}>
                            <SelectTrigger className="h-16 text-lg border-2 border-green-200 hover:border-green-300 focus:border-green-500 transition-all duration-200 shadow-lg hover:shadow-xl">
                              <SelectValue placeholder="Uhrzeit auswählen" />
                            </SelectTrigger>
                            <SelectContent className="border-0 shadow-2xl">
                              {availableSlots.map((time) => (
                                <SelectItem key={time} value={time} className="hover:bg-green-50 transition-colors">
                                  <div className="flex items-center justify-between py-3 px-2">
                                    <span className="text-xl font-semibold text-gray-800">{time}</span>
                                    <Clock className="h-5 w-5 text-green-500" />
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                            {!selectedDate ? "📅 Bitte wähle zuerst ein Datum aus" : "❌ An diesem Tag sind leider keine Termine verfügbar"}
                          </div>
                        )}
                      </div>
                      
                      {selectedTime && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-lg transform hover:scale-105 transition-all duration-300">
                          <h3 className="font-bold text-green-800 mb-3 text-lg">⏰ Ausgewählte Uhrzeit:</h3>
                          <p className="text-xl font-semibold text-green-900">{selectedTime}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Schritt 4: Kundeninformationen */}
                  {currentStep === 4 && (
                    <div className="space-y-8">
                      <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-4 mb-8">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          Deine Kontaktdaten
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="name" className="text-lg font-semibold text-gray-700">Vollständiger Name *</Label>
                            <Input
                              id="name"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Dein vollständiger Name"
                              className="h-14 text-lg border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-all duration-200 shadow-lg focus:shadow-xl"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="email" className="text-lg font-semibold text-gray-700">E-Mail-Adresse *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="deine.email@beispiel.ch"
                              className="h-14 text-lg border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-all duration-200 shadow-lg focus:shadow-xl"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="phone" className="text-lg font-semibold text-gray-700">Telefonnummer (optional)</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="+41 78 123 45 67"
                              className="h-14 text-lg border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-all duration-200 shadow-lg focus:shadow-xl"
                            />
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="notes" className="text-lg font-semibold text-gray-700">Anmerkungen (optional)</Label>
                            <Input
                              id="notes"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Besondere Wünsche oder Anmerkungen"
                              className="h-14 text-lg border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-all duration-200 shadow-lg focus:shadow-xl"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verbesserte Navigation Buttons */}
                  <div className="flex justify-between pt-8">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="flex items-center gap-3 h-14 px-8 text-lg font-semibold border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <ArrowLeft className="w-5 h-5" />
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
                        className="flex items-center gap-3 h-14 px-10 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                      >
                        Weiter
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="flex items-center gap-3 h-16 px-12 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                        disabled={isLoading}
                      >
                        {isLoading ? "Buche Termin..." : "✨ Termin buchen"}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Verbesserte Zusammenfassung */}
          <div className="space-y-8">
            {/* Buchungsübersicht */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl backdrop-saturate-150">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 p-6">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  Buchungsübersicht
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {selectedService && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Dienstleistung:</span>
                    <span className="font-semibold text-gray-800">{getSelectedServiceName()}</span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Datum:</span>
                    <span className="font-semibold text-gray-800">{format(selectedDate, "dd.MM.yyyy", { locale: de })}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Uhrzeit:</span>
                    <span className="font-semibold text-gray-800">{selectedTime}</span>
                  </div>
                )}
                {selectedService && (
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-gray-600">Preis:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">CHF {getSelectedServicePrice().toFixed(0)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verbesserte Informationen */}
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl backdrop-saturate-150">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/50 p-6">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  Wichtige Informationen
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-sm text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                  <p>⏰ Bitte sei 10 Minuten vor deinem Termin da</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                  <p>🚫 Bei Verspätung kann der Termin nicht garantiert werden</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                  <p>📞 Stornierungen bitte spätestens 24h vorher</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
                  <p>💬 Bei Fragen: +41 78 850 85 95</p>
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
