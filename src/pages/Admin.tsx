import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, Scissors, Plus, Edit, Trash2, Eye, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  service_name: string;
  stylist_name: string;
  price: number;
  status: string;
  notes: string;
}

interface Stylist {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  category: string;
  is_active: boolean;
}

const Admin = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // Neue States für Service-Management
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    duration: 30,
    price: 50,
    category: 'Haarschnitt',
    is_active: true
  });

  const { toast } = useToast();
  const salonId = 'default-salon';

  useEffect(() => {
    loadAppointments();
    loadStylists();
    loadServices();
  }, [selectedDate, selectedStatus]);

  const loadAppointments = async () => {
    try {
      let url = `http://localhost:3001/api/salon/${salonId}/appointments`;
      const params = new URLSearchParams();
      
      if (selectedDate) params.append('date', selectedDate);
      if (selectedStatus) params.append('status', selectedStatus);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Termine:', error);
    }
  };

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

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Status geändert zu: ${newStatus}`,
        }),
      });

      if (response.ok) {
        toast({
          title: "Status aktualisiert",
          description: "Der Termin-Status wurde erfolgreich geändert.",
        });
        loadAppointments();
      } else {
        toast({
          title: "Fehler",
          description: "Der Status konnte nicht aktualisiert werden.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verbindungsfehler",
        description: "Bitte überprüfe deine Internetverbindung.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Bestätigt</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Storniert</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Abgeschlossen</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  // Service-Formular zurücksetzen
  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      description: '',
      duration: 30,
      price: 50,
      category: 'Haarschnitt',
      is_active: true
    });
    setEditingService(null);
    setShowServiceForm(false);
  };

  // Service erstellen oder bearbeiten
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceForm.name || !serviceForm.duration || !serviceForm.price || !serviceForm.category) {
      toast({
        title: "Fehlende Informationen",
        description: "Bitte fülle alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let response;
      
      if (editingService) {
        // Service bearbeiten
        response = await fetch(`http://localhost:3001/api/salon/${salonId}/services/${editingService.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serviceForm),
        });
      } else {
        // Neuen Service erstellen
        response = await fetch(`http://localhost:3001/api/salon/${salonId}/services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(serviceForm),
        });
      }

      if (response.ok) {
        toast({
          title: editingService ? "Service aktualisiert!" : "Service erstellt!",
          description: editingService 
            ? "Der Service wurde erfolgreich bearbeitet." 
            : "Der neue Service wurde erfolgreich erstellt.",
        });
        
        resetServiceForm();
        loadServices();
      } else {
        const errorData = await response.json();
        toast({
          title: "Fehler",
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

  // Service bearbeiten
  const editService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      is_active: service.is_active
    });
    setShowServiceForm(true);
  };

  // Service löschen
  const deleteService = async (serviceId: string) => {
    if (!confirm('Möchtest du diesen Service wirklich löschen?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/salon/${salonId}/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Service gelöscht!",
          description: "Der Service wurde erfolgreich gelöscht.",
        });
        loadServices();
      } else {
        toast({
          title: "Fehler",
          description: "Der Service konnte nicht gelöscht werden.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verbindungsfehler",
        description: "Bitte überprüfe deine Internetverbindung.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 relative overflow-hidden">
      {/* Hintergrund-Dekoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-slate-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header mit verbessertem Design */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-8 shadow-2xl">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-600 bg-clip-text text-transparent mb-8 font-heading drop-shadow-sm">
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Verwalte Termine, Friseure und Dienstleistungen im Schnittwerk
          </p>
        </div>

        {/* Filter-Sektion mit verbessertem Design */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl backdrop-saturate-150 mb-8">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 p-6">
            <CardTitle className="text-2xl flex items-center gap-3 text-gray-800">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              Filter & Suche
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor="date" className="text-lg font-semibold text-gray-700">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-12 text-lg border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 shadow-lg focus:shadow-xl"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="status" className="text-lg font-semibold text-gray-700">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-12 text-lg border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-all duration-200 shadow-lg focus:shadow-xl">
                    <SelectValue placeholder="Alle Status" />
                  </SelectTrigger>
                  <SelectContent className="border-0 shadow-2xl">
                    <SelectItem value="">Alle Status</SelectItem>
                    <SelectItem value="confirmed">Bestätigt</SelectItem>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="cancelled">Storniert</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => { setSelectedDate(''); setSelectedStatus(''); }}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  🔄 Filter zurücksetzen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Übersichtskarten */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heute</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter(a => a.appointment_date === format(new Date(), 'yyyy-MM-dd')).length}
              </div>
              <p className="text-xs text-muted-foreground">Termine heute</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bestätigt</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {appointments.filter(a => a.status === 'confirmed').length}
              </div>
              <p className="text-xs text-muted-foreground">Bestätigte Termine</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Friseure</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stylists.filter(s => s.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">Aktive Friseure</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
              <Scissors className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {services.filter(s => s.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">Aktive Services</p>
            </CardContent>
          </Card>
        </div>

        {/* Hauptinhalt */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">Termine</TabsTrigger>
            <TabsTrigger value="stylists">Friseure</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          {/* Termine Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Termine verwalten
                </CardTitle>
                <CardDescription>
                  Alle Termine einsehen und verwalten
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filter */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Datum & Zeit</TableHead>
                        <TableHead>Kunde</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Friseur</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Preis</TableHead>
                        <TableHead>Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {format(new Date(appointment.appointment_date), 'dd.MM.yyyy', { locale: de })}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {appointment.start_time} - {appointment.end_time}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{appointment.customer_name}</span>
                              <span className="text-sm text-muted-foreground">{appointment.customer_email}</span>
                              {appointment.customer_phone && (
                                <span className="text-sm text-muted-foreground">{appointment.customer_phone}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{appointment.service_name}</span>
                              {appointment.notes && (
                                <span className="text-sm text-muted-foreground">{appointment.notes}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{appointment.stylist_name}</span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(appointment.status)}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">{appointment.price.toFixed(2)} €</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Termin Details</DialogTitle>
                                    <DialogDescription>
                                      Detaillierte Informationen zum Termin
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">Kunde</Label>
                                        <p>{appointment.customer_name}</p>
                                        <p className="text-sm text-muted-foreground">{appointment.customer_email}</p>
                                        {appointment.customer_phone && (
                                          <p className="text-sm text-muted-foreground">{appointment.customer_phone}</p>
                                        )}
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Termin</Label>
                                        <p>{format(new Date(appointment.appointment_date), 'dd.MM.yyyy', { locale: de })}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {appointment.start_time} - {appointment.end_time}
                                        </p>
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Service</Label>
                                      <p>{appointment.service_name}</p>
                                      <p className="text-sm text-muted-foreground">{appointment.price.toFixed(2)} €</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Friseur</Label>
                                      <p>{appointment.stylist_name}</p>
                                    </div>
                                    {appointment.notes && (
                                      <div>
                                        <Label className="text-sm font-medium">Anmerkungen</Label>
                                        <p>{appointment.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>

                              {appointment.status === 'confirmed' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {appointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Termine gefunden
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friseure Tab */}
          <TabsContent value="stylists" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Friseure verwalten
                </CardTitle>
                <CardDescription>
                  Alle Friseure einsehen und verwalten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stylists.map((stylist) => (
                    <Card key={stylist.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {stylist.name}
                          <Badge variant={stylist.is_active ? "default" : "secondary"}>
                            {stylist.is_active ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{stylist.specialties}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">E-Mail:</span> {stylist.email}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Telefon:</span> {stylist.phone}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl backdrop-saturate-150">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100/50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-3 text-gray-800">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Scissors className="w-4 h-4 text-white" />
                      </div>
                      Services verwalten
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 mt-2">
                      Alle Services einsehen, bearbeiten und neue erstellen
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowServiceForm(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Neuer Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <Card key={service.id} className="shadow-lg hover:shadow-xl transition-all duration-200 border-0 bg-white/90">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-gray-800 mb-2">{service.name}</CardTitle>
                            <CardDescription className="text-gray-600 text-sm leading-relaxed">{service.description}</CardDescription>
                          </div>
                          <Badge 
                            variant={service.is_active ? "default" : "secondary"}
                            className={cn(
                              "ml-2",
                              service.is_active 
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
                                : "bg-gray-300 text-gray-700"
                            )}
                          >
                            {service.is_active ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <span className="font-semibold text-gray-700">⏱️ Dauer:</span>
                            <div className="text-gray-800 font-medium">{service.duration} Min.</div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <span className="font-semibold text-gray-700">💰 Preis:</span>
                            <div className="text-purple-600 font-bold">CHF {service.price.toFixed(0)}</div>
                          </div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded-lg">
                          <span className="font-semibold text-purple-700 text-sm">🏷️ Kategorie:</span>
                          <div className="text-purple-800 font-medium">{service.category}</div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editService(service)}
                            className="flex-1 border-purple-200 hover:border-purple-400 hover:bg-purple-50 text-purple-700 transition-all duration-200"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Bearbeiten
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteService(service.id)}
                            className="flex-1 border-red-200 hover:border-red-400 hover:bg-red-50 text-red-700 transition-all duration-200"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Löschen
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {services.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Scissors className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Keine Services gefunden</p>
                    <p className="text-sm">Erstelle deinen ersten Service!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Service-Formular Modal */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100/50 p-6">
              <CardTitle className="text-2xl flex items-center gap-3 text-gray-800">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-white" />
                </div>
                {editingService ? 'Service bearbeiten' : 'Neuen Service erstellen'}
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 mt-2">
                {editingService ? 'Bearbeite die Details des ausgewählten Services' : 'Erstelle einen neuen Service für dein Salon'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleServiceSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="serviceName" className="text-lg font-semibold text-gray-700">Service-Name *</Label>
                    <Input
                      id="serviceName"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                      placeholder="z.B. Coloration Vollfarbe"
                      className="h-12 text-lg border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-all duration-200 shadow-lg focus:shadow-xl"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="serviceCategory" className="text-lg font-semibold text-gray-700">Kategorie *</Label>
                    <Select value={serviceForm.category} onValueChange={(value) => setServiceForm({...serviceForm, category: value})}>
                      <SelectTrigger className="h-12 text-lg border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-all duration-200 shadow-lg focus:shadow-xl">
                        <SelectValue placeholder="Kategorie auswählen" />
                      </SelectTrigger>
                      <SelectContent className="border-0 shadow-2xl">
                        <SelectItem value="Haarschnitt">Haarschnitt</SelectItem>
                        <SelectItem value="Coloration">Coloration</SelectItem>
                        <SelectItem value="Styling">Styling</SelectItem>
                        <SelectItem value="Behandlung">Behandlung</SelectItem>
                        <SelectItem value="Pflege">Pflege</SelectItem>
                        <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="serviceDescription" className="text-lg font-semibold text-gray-700">Beschreibung</Label>
                  <Input
                    id="serviceDescription"
                    value={serviceForm.description}
                    onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})}
                    placeholder="Detaillierte Beschreibung des Services..."
                    className="h-12 text-lg border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-all duration-200 shadow-lg focus:shadow-xl"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="serviceDuration" className="text-lg font-semibold text-gray-700">Dauer (Minuten) *</Label>
                    <Input
                      id="serviceDuration"
                      type="number"
                      min="15"
                      step="15"
                      value={serviceForm.duration}
                      onChange={(e) => setServiceForm({...serviceForm, duration: parseInt(e.target.value)})}
                      className="h-12 text-lg border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-all duration-200 shadow-lg focus:shadow-xl"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="servicePrice" className="text-lg font-semibold text-gray-700">Preis (CHF) *</Label>
                    <Input
                      id="servicePrice"
                      type="number"
                      min="0"
                      step="5"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({...serviceForm, price: parseInt(e.target.value)})}
                      className="h-12 text-lg border-2 border-gray-200 hover:border-purple-300 focus:border-purple-500 transition-all duration-200 shadow-lg focus:shadow-xl"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="serviceActive"
                    checked={serviceForm.is_active}
                    onChange={(e) => setServiceForm({...serviceForm, is_active: e.target.checked})}
                    className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                  />
                  <Label htmlFor="serviceActive" className="text-lg font-semibold text-gray-700">Service ist aktiv</Label>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetServiceForm}
                    className="flex-1 h-14 text-lg font-semibold border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Abbrechen
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                  >
                    {isLoading ? "Speichere..." : (editingService ? "Aktualisieren" : "Service erstellen")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;
