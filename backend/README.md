# Salon Booking Backend

Backend für das Terminbuchungssystem von Schnittwerk Your Style.

## Installation

```bash
npm install
```

## Entwicklung starten

```bash
npm run dev
```

Der Server läuft dann auf http://localhost:3001

## Produktion starten

```bash
npm start
```

## API-Endpunkte

### Salon
- `GET /api/salon/:id` - Salon-Informationen abrufen

### Friseure
- `GET /api/salon/:salonId/stylists` - Alle Friseure eines Salons
- `POST /api/salon/:salonId/stylists` - Neuen Friseur hinzufügen (Admin)

### Services
- `GET /api/salon/:salonId/services` - Alle Services eines Salons
- `POST /api/salon/:salonId/services` - Neuen Service hinzufügen (Admin)

### Verfügbarkeit
- `GET /api/availability/:salonId/:date` - Verfügbare Termine für einen Tag

### Termine
- `GET /api/salon/:salonId/appointments` - Alle Termine eines Salons
- `POST /api/appointments` - Neuen Termin buchen
- `PATCH /api/appointments/:id` - Termin-Status ändern

## Datenbank

Das System verwendet SQLite als Datenbank. Die Datei `salon.db` wird automatisch erstellt.

## Umgebungsvariablen

- `PORT` - Port für den Server (Standard: 3001)

## Deployment

Für Produktion empfehlen wir:
- Render.com (kostenlos für Start)
- Vercel
- Railway

Setze die Umgebungsvariable `PORT` entsprechend der Hosting-Plattform.
