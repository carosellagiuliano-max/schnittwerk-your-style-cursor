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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Verwalte Termine, Friseure und Services</p>
        </div>

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
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="date-filter">Datum</Label>
                    <Input
                      id="date-filter"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alle Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Alle Status</SelectItem>
                        <SelectItem value="confirmed">Bestätigt</SelectItem>
                        <SelectItem value="cancelled">Storniert</SelectItem>
                        <SelectItem value="completed">Abgeschlossen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={() => { setSelectedDate(''); setSelectedStatus(''); }}>
                      Filter zurücksetzen
                    </Button>
                  </div>
                </div>

                {/* Termine Tabelle */}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="w-5 h-5" />
                  Services verwalten
                </CardTitle>
                <CardDescription>
                  Alle Services einsehen und verwalten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <Card key={service.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {service.name}
                          <Badge variant={service.is_active ? "default" : "secondary"}>
                            {service.is_active ? "Aktiv" : "Inaktiv"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Dauer:</span>
                          <span>{service.duration} Min.</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Preis:</span>
                          <span className="font-medium text-primary">{service.price.toFixed(2)} €</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Kategorie:</span> {service.category}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
