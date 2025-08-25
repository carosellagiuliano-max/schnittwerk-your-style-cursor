# Schnittwerk Your Style - Terminbuchungssystem

Eine moderne Website für den Friseursalon "Schnittwerk Your Style" mit integriertem Terminbuchungssystem.

## 🚀 Features

### Für Kunden
- **Terminbuchung**: Einfache Online-Buchung von Friseurterminen
- **Service-Auswahl**: Verschiedene Services mit Preisen und Dauer
- **Friseur-Auswahl**: Wähle deinen bevorzugten Friseur
- **Verfügbarkeitsprüfung**: Echtzeit-Anzeige verfügbarer Termine
- **Responsive Design**: Funktioniert auf allen Geräten

### Für Admins
- **Dashboard**: Übersicht über alle Termine, Friseure und Services
- **Terminverwaltung**: Termine bestätigen, stornieren oder als abgeschlossen markieren
- **Friseur-Verwaltung**: Friseure hinzufügen und verwalten
- **Service-Verwaltung**: Services mit Preisen und Dauer verwalten

## 🛠️ Technologie-Stack

### Frontend
- **React 18** mit TypeScript
- **Vite** für schnelle Entwicklung
- **Tailwind CSS** für Styling
- **shadcn/ui** für UI-Komponenten
- **React Router** für Navigation
- **React Hook Form** für Formulare
- **date-fns** für Datumsverarbeitung

### Backend
- **Node.js** mit Express
- **SQLite** Datenbank
- **Luxon** für Zeitverarbeitung
- **UUID** für eindeutige IDs
- **CORS** für Cross-Origin-Requests

## 📁 Projektstruktur

```
schnittwerk-your-style-main/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui Komponenten
│   │   ├── sections/     # Hauptseiten-Komponenten
│   │   ├── auth/         # Authentifizierung
│   │   └── booking/      # Buchungs-Dialoge
│   ├── pages/
│   │   ├── Index.tsx     # Startseite
│   │   ├── Services.tsx  # Leistungen
│   │   ├── Gallery.tsx   # Galerie
│   │   ├── AboutContact.tsx # Über uns
│   │   ├── Booking.tsx   # Terminbuchung (NEU)
│   │   └── Admin.tsx     # Admin-Dashboard (NEU)
│   ├── contexts/         # React Contexts
│   ├── hooks/            # Custom Hooks
│   └── lib/              # Utilities
├── backend/              # Backend-Server
│   ├── server.js         # Express-Server
│   ├── package.json      # Backend-Dependencies
│   └── README.md         # Backend-Dokumentation
└── package.json          # Frontend-Dependencies
```

## 🚀 Installation & Start

### 1. Frontend starten
```bash
cd schnittwerk-your-style-main
npm install
npm run dev
```
Das Frontend läuft dann auf http://localhost:5173

### 2. Backend starten
```bash
cd schnittwerk-your-style-main/backend
npm install
npm run dev
```
Das Backend läuft dann auf http://localhost:3001

## 🌐 Verfügbare Routen

- `/` - Startseite
- `/leistungen` - Leistungen & Preise
- `/galerie` - Galerie
- `/ueber-uns` - Über uns & Kontakt
- `/buchen` - **Terminbuchung (NEU)**
- `/admin` - **Admin-Dashboard (NEU)**

## 📊 API-Endpunkte

### Salon
- `GET /api/salon/:id` - Salon-Informationen

### Friseure
- `GET /api/salon/:salonId/stylists` - Alle Friseure
- `POST /api/salon/:salonId/stylists` - Neuen Friseur hinzufügen

### Services
- `GET /api/salon/:salonId/services` - Alle Services
- `POST /api/salon/:salonId/services` - Neuen Service hinzufügen

### Verfügbarkeit
- `GET /api/availability/:salonId/:date` - Verfügbare Termine

### Termine
- `GET /api/salon/:salonId/appointments` - Alle Termine
- `POST /api/appointments` - Neuen Termin buchen
- `PATCH /api/appointments/:id` - Termin-Status ändern

## 🔧 Konfiguration

### Standard-Daten
Das System wird mit folgenden Standard-Daten initialisiert:

**Salon**: Schnittwerk Your Style
**Friseure**: 
- Vanessa Müller (Haarschnitte, Färben, Styling)
- Sarah Schmidt (Haarschnitte, Extensions, Hochsteckfrisuren)

**Services**:
- Haarschnitt Damen (60 Min., 45€)
- Haarschnitt Herren (45 Min., 35€)
- Haarfärben (120 Min., 85€)
- Strähnen (150 Min., 95€)
- Hochsteckfrisur (90 Min., 75€)

**Öffnungszeiten**:
- Montag-Freitag: 09:00-18:00
- Samstag: 09:00-16:00
- Sonntag: Geschlossen

## 🚀 Deployment

### Frontend (Netlify)
1. Code zu GitHub pushen
2. Netlify mit GitHub-Repo verbinden
3. Build-Command: `npm run build`
4. Publish-Directory: `dist`

### Backend (Render)
1. Backend-Ordner zu separatem GitHub-Repo pushen
2. Render.com: "New Web Service"
3. Build-Command: `npm install`
4. Start-Command: `npm start`

## 🔒 Sicherheit

- CORS für Cross-Origin-Requests konfiguriert
- SQL-Injection-Schutz durch parametrisierte Queries
- Input-Validierung im Frontend und Backend

## 📱 Responsive Design

Das System ist vollständig responsive und funktioniert auf:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎨 Design-System

Verwendet das bestehende Design-System von Schnittwerk Your Style:
- Primärfarbe: Rosa/Lila
- Sekundärfarbe: Grau
- Typografie: Moderne, saubere Schriftarten
- Icons: Lucide React Icons

## 🔄 Updates & Wartung

### Regelmäßige Aufgaben
- Datenbank-Backups
- Log-Überwachung
- Performance-Monitoring
- Sicherheits-Updates

### Neue Features hinzufügen
1. Backend-API erweitern
2. Frontend-Komponenten erstellen
3. Routing aktualisieren
4. Tests durchführen

## 📞 Support

Bei Fragen oder Problemen:
- GitHub Issues verwenden
- Backend-Logs überprüfen
- Browser-Entwicklertools für Frontend-Debugging

## 📄 Lizenz

Proprietär - Alle Rechte vorbehalten für Schnittwerk Your Style

---

**Entwickelt mit ❤️ für Schnittwerk Your Style**
