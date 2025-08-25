import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scissors, Palette, Eye, Sparkles, Clock, Euro, MapPin, Calendar, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/ui/navigation';
import HaircutsDialog from '@/components/booking/haircuts-dialog';
import LocationDialog from '@/components/booking/location-dialog';

const Services = () => {
  const womenServices = [
    {
      icon: Scissors,
      title: 'Haarschnitte Damen',
      description: 'Individuelle Schnitte für die moderne Frau',
      services: [
        { name: 'Damenschnitt', price: 'CHF 65-85', duration: '60 Min' },
        { name: 'Bob & Lob', price: 'CHF 70-90', duration: '75 Min' },
        { name: 'Stufen & Layers', price: 'CHF 75-95', duration: '90 Min' },
        { name: 'Pony schneiden', price: 'CHF 30', duration: '30 Min' }
      ]
    },
    {
      icon: Palette,
      title: 'Colorationen Damen',
      description: 'Professionelle Haarfarbe für jeden Typ',
      services: [
        { name: 'Vollcoloration', price: 'CHF 85-120', duration: '120 Min' },
        { name: 'Balayage', price: 'CHF 120-180', duration: '180 Min' },
        { name: 'Strähnen', price: 'CHF 100-150', duration: '150 Min' },
        { name: 'Ansatzbehandlung', price: 'CHF 65-85', duration: '90 Min' }
      ]
    }
  ];

  const menServices = [
    {
      icon: Scissors,
      title: 'Haarschnitte Herren',
      description: 'Klassische und moderne Herrenschnitte',
      services: [
        { name: 'Herrenschnitt klassisch', price: 'CHF 45-55', duration: '45 Min' },
        { name: 'Modern Fade', price: 'CHF 55-65', duration: '60 Min' },
        { name: 'Bart trimmen', price: 'CHF 25', duration: '30 Min' },
        { name: 'Komplett-Service', price: 'CHF 75', duration: '90 Min' }
      ]
    },
    {
      icon: Palette,
      title: 'Colorationen Herren',
      description: 'Dezente Farbakzente und Grauabdeckung',
      services: [
        { name: 'Grauabdeckung', price: 'CHF 55-75', duration: '60 Min' },
        { name: 'Intensivtönung', price: 'CHF 65-85', duration: '75 Min' },
        { name: 'Dezente Strähnen', price: 'CHF 80-120', duration: '90 Min' },
        { name: 'Bart färben', price: 'CHF 35', duration: '30 Min' }
      ]
    }
  ];

  const generalServices = [
    {
      icon: Eye,
      title: 'Wimpern & Brauen',
      description: 'Perfekte Augenpartie für Damen und Herren',
      services: [
        { name: 'Wimpern färben', price: 'CHF 25', duration: '20 Min' },
        { name: 'Brauen zupfen', price: 'CHF 30', duration: '20 Min' },
        { name: 'Brauen färben', price: 'CHF 25', duration: '15 Min' },
        { name: 'Komplettbehandlung', price: 'CHF 65', duration: '45 Min' }
      ]
    },
    {
      icon: Sparkles,
      title: 'Zusatzleistungen',
      description: 'Weitere Treatments für Ihr Wohlbefinden',
      services: [
        { name: 'Haarkur intensiv', price: 'CHF 35', duration: '30 Min' },
        { name: 'Kopfhautmassage', price: 'CHF 25', duration: '20 Min' },
        { name: 'Waschen & Föhnen', price: 'CHF 35', duration: '30 Min' },
        { name: 'Kinderschnitt (bis 12 Jahre)', price: 'CHF 35', duration: '30 Min' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
            Leistungen & Preise
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Professionelle Haarpflege und Beauty-Behandlungen für Damen und Herren
          </p>
          
          {/* Quick Info Cards */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <LocationDialog>
              <Button variant="outline" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Standort
              </Button>
            </LocationDialog>
            <Link to="/contact">
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Öffnungszeiten
              </Button>
            </Link>
            <HaircutsDialog>
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Service
              </Button>
            </HaircutsDialog>
          </div>
        </div>

        {/* Damen Services */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-bold text-primary mb-2">Leistungen für Damen</h2>
            <p className="text-muted-foreground">Individuell angepasst an Ihren Stil und Typ</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {womenServices.map((category, index) => (
              <Card key={index} className="border-border bg-card hover:shadow-soft transition-elegant">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-pink-100 rounded-lg">
                      <category.icon className="h-8 w-8 text-pink-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-heading">{category.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.services.map((service, serviceIndex) => (
                      <div key={serviceIndex} className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
                        <div>
                          <h4 className="font-medium text-foreground">{service.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {service.duration}
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-medium">
                          {service.price}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Herren Services */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-bold text-primary mb-2">Leistungen für Herren</h2>
            <p className="text-muted-foreground">Klassisch und modern - ganz nach Ihrem Geschmack</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {menServices.map((category, index) => (
              <Card key={index} className="border-border bg-card hover:shadow-soft transition-elegant">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <category.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-heading">{category.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.services.map((service, serviceIndex) => (
                      <div key={serviceIndex} className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
                        <div>
                          <h4 className="font-medium text-foreground">{service.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {service.duration}
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-medium">
                          {service.price}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* General Services */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-bold text-primary mb-2">Weitere Leistungen</h2>
            <p className="text-muted-foreground">Zusätzliche Treatments für Ihr Wohlbefinden</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {generalServices.map((category, index) => (
              <Card key={index} className="border-border bg-card hover:shadow-soft transition-elegant">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-secondary rounded-lg">
                      <category.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-heading">{category.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.services.map((service, serviceIndex) => (
                      <div key={serviceIndex} className="flex justify-between items-center py-2 border-b border-border/50 last:border-b-0">
                        <div>
                          <h4 className="font-medium text-foreground">{service.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {service.duration}
                          </div>
                        </div>
                        <Badge variant="secondary" className="font-medium">
                          {service.price}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-2xl font-heading font-bold text-primary mb-4">
              Wichtige Hinweise
            </h3>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Alle Preise verstehen sich als Richtpreise. Der finale Preis wird nach der persönlichen Beratung und Haaranalyse festgelegt.
              </p>
              <p>
                Bei langen oder sehr dicken Haaren können Aufschläge anfallen.
              </p>
              <p>
                Termine können bis 24 Stunden vorher kostenfrei storniert werden.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Badge variant="outline">Trinity Haircare Premium Produkte</Badge>
              <Badge variant="outline">Professionelle Beratung inklusive</Badge>
              <Badge variant="outline">Moderne Techniken</Badge>
              <Badge variant="outline">Garantie auf alle Leistungen</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;