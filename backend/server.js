import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Datenbank initialisieren
const db = new sqlite3.Database('./salon.db', (err) => {
  if (err) {
    console.error('Fehler beim Öffnen der Datenbank:', err);
  } else {
    console.log('SQLite-Datenbank erfolgreich verbunden');
    initializeDatabase();
  }
});

// Datenbank-Tabellen erstellen
function initializeDatabase() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS salons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      opening_hours TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS stylists (
      id TEXT PRIMARY KEY,
      salon_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      specialties TEXT,
      working_hours TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (salon_id) REFERENCES salons (id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      salon_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      duration INTEGER NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      category TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (salon_id) REFERENCES salons (id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      salon_id TEXT NOT NULL,
      stylist_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      appointment_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT DEFAULT 'confirmed',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (salon_id) REFERENCES salons (id),
      FOREIGN KEY (stylist_id) REFERENCES stylists (id),
      FOREIGN KEY (service_id) REFERENCES services (id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS working_hours (
      id TEXT PRIMARY KEY,
      salon_id TEXT NOT NULL,
      day_of_week INTEGER NOT NULL,
      open_time TEXT NOT NULL,
      close_time TEXT NOT NULL,
      is_working_day BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (salon_id) REFERENCES salons (id)
    )`
  ];

  // Alle Tabellen erstellen und dann Standard-Daten einfügen
  let tablesCreated = 0;
  const totalTables = tables.length;

  tables.forEach(table => {
    db.run(table, (err) => {
      if (err) {
        console.error('Fehler beim Erstellen der Tabelle:', err);
      }
      tablesCreated++;
      
      // Wenn alle Tabellen erstellt wurden, Standard-Daten einfügen
      if (tablesCreated === totalTables) {
        insertDefaultData();
      }
    });
  });
}

// Standard-Daten einfügen
function insertDefaultData() {
  // Standard-Salon erstellen (falls noch nicht vorhanden)
  db.get("SELECT id FROM salons WHERE id = 'default-salon'", (err, row) => {
    if (err) {
      console.error('Fehler beim Prüfen des Standard-Salons:', err);
      return;
    }
    
    if (!row) {
      console.log('Erstelle Standard-Salon...');
      db.run(`INSERT INTO salons (id, name, address, phone, email, opening_hours) 
               VALUES (?, ?, ?, ?, ?, ?)`,
        ['default-salon', 'Schnittwerk Your Style', 'Rorschacherstrasse 152, 9000 St. Gallen, Schweiz', 
         '+41 78 850 85 95', 'info@schnittwerk-your-style.ch', '{"monday": {"open": "09:00", "close": "18:30"}, "tuesday": {"open": "09:00", "close": "18:30"}, "wednesday": {"open": "09:00", "close": "18:30"}, "thursday": {"open": "09:00", "close": "18:30"}, "friday": {"open": "09:00", "close": "18:30"}, "saturday": {"open": "09:00", "close": "15:00"}}'], 
        function(err) {
          if (err) {
            console.error('Fehler beim Erstellen des Standard-Salons:', err);
            return;
          }
          console.log('Standard-Salon erfolgreich erstellt');
          
          // Standard-Öffnungszeiten erstellen
          insertDefaultWorkingHours();
        });
    } else {
      console.log('Standard-Salon bereits vorhanden');
    }
  });
}

// Standard-Öffnungszeiten einfügen
function insertDefaultWorkingHours() {
  const defaultHours = [
    [1, '09:00', '18:30'], // Montag
    [2, '09:00', '18:30'], // Dienstag
    [3, '09:00', '18:30'], // Mittwoch
    [4, '09:00', '18:30'], // Donnerstag
    [5, '09:00', '18:30'], // Freitag
    [6, '09:00', '15:00'], // Samstag
  ];
  
  let hoursInserted = 0;
  const totalHours = defaultHours.length;
  
  defaultHours.forEach(([day, open, close]) => {
    db.run(`INSERT INTO working_hours (id, salon_id, day_of_week, open_time, close_time) 
             VALUES (?, ?, ?, ?, ?)`,
      [uuidv4(), 'default-salon', day, open, close], function(err) {
        if (err) {
          console.error('Fehler beim Erstellen der Öffnungszeiten:', err);
        }
        hoursInserted++;
        
        if (hoursInserted === totalHours) {
          console.log('Standard-Öffnungszeiten erfolgreich erstellt');
          insertDefaultStylists();
        }
      });
  });
}

// Standard-Friseure einfügen
function insertDefaultStylists() {
  const defaultStylists = [
    {
      name: 'Vanessa Carosella',
      email: 'vanessa@schnittwerk-your-style.ch',
      phone: '+41 78 850 85 95',
      specialties: 'Haarschnitte, Colorationen, Balayage, Trend-Cuts',
      workingHours: '{"monday": {"start": "09:00", "end": "18:30"}, "tuesday": {"start": "09:00", "end": "18:30"}, "wednesday": {"start": "09:00", "end": "18:30"}, "thursday": {"start": "09:00", "end": "18:30"}, "friday": {"start": "09:00", "end": "18:30"}, "saturday": {"start": "09:00", "end": "15:00"}}'
    },
    {
      name: 'Sarah Schmidt',
      email: 'sarah@schnittwerk-your-style.ch',
      phone: '+41 78 850 85 96',
      specialties: 'Haarschnitte, Extensions, Hochsteckfrisuren, Wimpern & Brauen',
      workingHours: '{"monday": {"start": "10:00", "end": "19:00"}, "tuesday": {"start": "10:00", "end": "19:00"}, "wednesday": {"start": "10:00", "end": "19:00"}, "thursday": {"start": "10:00", "end": "19:00"}, "friday": {"start": "10:00", "end": "19:00"}, "saturday": {"start": "09:00", "end": "15:00"}}'
    }
  ];
  
  let stylistsInserted = 0;
  const totalStylists = defaultStylists.length;
  
  defaultStylists.forEach(stylist => {
    db.run(`INSERT INTO stylists (id, salon_id, name, email, phone, specialties, working_hours) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), 'default-salon', stylist.name, stylist.email, stylist.phone, stylist.specialties, stylist.workingHours], 
      function(err) {
        if (err) {
          console.error('Fehler beim Erstellen des Friseurs:', err);
        }
        stylistsInserted++;
        
        if (stylistsInserted === totalStylists) {
          console.log('Standard-Friseure erfolgreich erstellt');
          insertDefaultServices();
        }
      });
  });
}

// Standard-Services einfügen
function insertDefaultServices() {
  const defaultServices = [
    {
      name: 'Haarschnitt Damen',
      description: 'Professioneller Haarschnitt für Damen inkl. Waschen, Schneiden und Föhnen',
      duration: 60,
      price: 65.00,
      category: 'Haarschnitt'
    },
    {
      name: 'Haarschnitt Herren',
      description: 'Professioneller Haarschnitt für Herren inkl. Waschen, Schneiden und Styling',
      duration: 45,
      price: 45.00,
      category: 'Haarschnitt'
    },
    {
      name: 'Coloration Vollfarbe',
      description: 'Professionelle Vollcoloration mit hochwertigen Trinity Haircare Produkten',
      duration: 120,
      price: 85.00,
      category: 'Coloration'
    },
    {
      name: 'Balayage',
      description: 'Natürliche Highlights mit freihändiger Technik für einen sun-kissed Look',
      duration: 150,
      price: 120.00,
      category: 'Coloration'
    },
    {
      name: 'Ansatzbehandlung',
      description: 'Professionelle Ansatzbehandlung für gleichmäßige Farbergebnisse',
      duration: 90,
      price: 65.00,
      category: 'Coloration'
    },
    {
      name: 'Hochsteckfrisur',
      description: 'Elegante Hochsteckfrisur für besondere Anlässe und Events',
      duration: 90,
      price: 75.00,
      category: 'Styling'
    },
    {
      name: 'Wimpern färben',
      description: 'Professionelle Wimpernfärbung für ausdrucksstarke Augen',
      duration: 30,
      price: 25.00,
      category: 'Beauty'
    },
    {
      name: 'Brauen zupfen & färben',
      description: 'Professionelle Augenbrauenbehandlung für perfekte Form',
      duration: 45,
      price: 35.00,
      category: 'Beauty'
    }
  ];
  
  let servicesInserted = 0;
  const totalServices = defaultServices.length;
  
  defaultServices.forEach(service => {
    db.run(`INSERT INTO services (id, salon_id, name, description, duration, price, category) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), 'default-salon', service.name, service.description, service.duration, service.price, service.category], 
      function(err) {
        if (err) {
          console.error('Fehler beim Erstellen des Services:', err);
        }
        servicesInserted++;
        
        if (servicesInserted === totalServices) {
          console.log('Standard-Services erfolgreich erstellt');
          console.log('Datenbank-Initialisierung abgeschlossen!');
        }
      });
  });
}

// API-Routen

// Salon-Informationen abrufen
app.get('/api/salon/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM salons WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Datenbankfehler' });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Salon nicht gefunden' });
      return;
    }
    res.json(row);
  });
});

// Alle Friseure eines Salons abrufen
app.get('/api/salon/:salonId/stylists', (req, res) => {
  const { salonId } = req.params;
  db.all('SELECT * FROM stylists WHERE salon_id = ? AND is_active = 1', [salonId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Datenbankfehler' });
      return;
    }
    res.json(rows);
  });
});

// Alle Services eines Salons abrufen
app.get('/api/salon/:salonId/services', (req, res) => {
  const { salonId } = req.params;
  db.all('SELECT * FROM services WHERE salon_id = ? AND is_active = 1', [salonId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Datenbankfehler' });
      return;
    }
    res.json(rows);
  });
});

// Verfügbare Termine für einen bestimmten Tag abrufen
app.get('/api/availability/:salonId/:date', (req, res) => {
  const { salonId, date } = req.params;
  
  // Tag der Woche ermitteln
  const dayOfWeek = DateTime.fromISO(date).weekday;
  
  // Öffnungszeiten für diesen Tag abrufen
  db.get('SELECT * FROM working_hours WHERE salon_id = ? AND day_of_week = ?', 
    [salonId, dayOfWeek], (err, workingHours) => {
    if (err) {
      res.status(500).json({ error: 'Datenbankfehler' });
      return;
    }
    
    if (!workingHours || !workingHours.is_working_day) {
      res.json({ available: false, message: 'Geschlossen' });
      return;
    }
    
    // Alle Friseure abrufen
    db.all('SELECT * FROM stylists WHERE salon_id = ? AND is_active = 1', [salonId], (err, stylists) => {
      if (err) {
        res.status(500).json({ error: 'Datenbankfehler' });
        return;
      }
      
      // Alle Services abrufen
      db.all('SELECT * FROM services WHERE salon_id = ? AND is_active = 1', [salonId], (err, services) => {
        if (err) {
          res.status(500).json({ error: 'Datenbankfehler' });
          return;
        }
        
        // Verfügbare Zeiten generieren (30-Minuten-Intervalle)
        const availableSlots = generateTimeSlots(workingHours.open_time, workingHours.close_time);
        
        // Bestehende Termine für diesen Tag abrufen
        db.all('SELECT * FROM appointments WHERE salon_id = ? AND appointment_date = ?', 
          [salonId, date], (err, appointments) => {
          if (err) {
            res.status(500).json({ error: 'Datenbankfehler' });
            return;
          }
          
          // Verfügbare Zeiten filtern (Termine entfernen)
          const filteredSlots = filterAvailableSlots(availableSlots, appointments, services);
          
          res.json({
            available: true,
            date: date,
            workingHours: {
              open: workingHours.open_time,
              close: workingHours.close_time
            },
            stylists: stylists,
            services: services,
            availableSlots: filteredSlots
          });
        });
      });
    });
  });
});

// Termin buchen
app.post('/api/appointments', (req, res) => {
  const {
    salonId,
    stylistId,
    serviceId,
    customerName,
    customerEmail,
    customerPhone,
    appointmentDate,
    startTime,
    notes
  } = req.body;
  
  // Service-Details abrufen für Dauer und Preis
  db.get('SELECT * FROM services WHERE id = ?', [serviceId], (err, service) => {
    if (err) {
      res.status(500).json({ error: 'Datenbankfehler' });
      return;
    }
    
    if (!service) {
      res.status(400).json({ error: 'Service nicht gefunden' });
      return;
    }
    
    // Endzeit berechnen
    const startDateTime = DateTime.fromISO(`${appointmentDate}T${startTime}`);
    const endDateTime = startDateTime.plus({ minutes: service.duration });
    const endTime = endDateTime.toFormat('HH:mm');
    
    // Kollisionsprüfung
    db.get(`SELECT COUNT(*) as count FROM appointments 
            WHERE salon_id = ? AND stylist_id = ? AND appointment_date = ? 
            AND status != 'cancelled'
            AND ((start_time <= ? AND end_time > ?) OR (start_time < ? AND end_time >= ?))`,
      [salonId, stylistId, appointmentDate, startTime, startTime, endTime, endTime], (err, row) => {
      if (err) {
        res.status(500).json({ error: 'Datenbankfehler' });
        return;
      }
      
      if (row.count > 0) {
        res.status(400).json({ error: 'Zeit bereits vergeben' });
        return;
      }
      
      // Termin erstellen
      const appointmentId = uuidv4();
      db.run(`INSERT INTO appointments 
              (id, salon_id, stylist_id, service_id, customer_name, customer_email, customer_phone, 
               appointment_date, start_time, end_time, notes) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [appointmentId, salonId, stylistId, serviceId, customerName, customerEmail, customerPhone,
         appointmentDate, startTime, endTime, notes], function(err) {
        if (err) {
          res.status(500).json({ error: 'Fehler beim Erstellen des Termins' });
          return;
        }
        
        // Erfolgreiche Buchung
        res.status(201).json({
          id: appointmentId,
          message: 'Termin erfolgreich gebucht',
          appointment: {
            id: appointmentId,
            date: appointmentDate,
            startTime: startTime,
            endTime: endTime,
            service: service.name,
            price: service.price
          }
        });
      });
    });
  });
});

// Alle Termine eines Salons abrufen
app.get('/api/salon/:salonId/appointments', (req, res) => {
  const { salonId } = req.params;
  const { date, status } = req.query;
  
  let query = `SELECT a.*, s.name as service_name, s.price, st.name as stylist_name 
                FROM appointments a 
                JOIN services s ON a.service_id = s.id 
                JOIN stylists st ON a.stylist_id = st.id 
                WHERE a.salon_id = ?`;
  let params = [salonId];
  
  if (date) {
    query += ' AND a.appointment_date = ?';
    params.push(date);
  }
  
  if (status) {
    query += ' AND a.status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY a.appointment_date, a.start_time';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Datenbankfehler' });
      return;
    }
    res.json(rows);
  });
});

// Termin-Status ändern (stornieren, bestätigen, etc.)
app.patch('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  db.run('UPDATE appointments SET status = ?, notes = ? WHERE id = ?', 
    [status, notes, id], function(err) {
    if (err) {
      res.status(500).json({ error: 'Fehler beim Aktualisieren des Termins' });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Termin nicht gefunden' });
      return;
    }
    
    res.json({ message: 'Termin erfolgreich aktualisiert' });
  });
});

// Admin: Friseur hinzufügen
app.post('/api/salon/:salonId/stylists', (req, res) => {
  const { salonId } = req.params;
  const { name, email, phone, specialties, workingHours } = req.body;
  
  const stylistId = uuidv4();
  db.run(`INSERT INTO stylists (id, salon_id, name, email, phone, specialties, working_hours) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [stylistId, salonId, name, email, phone, specialties, workingHours], function(err) {
    if (err) {
      res.status(500).json({ error: 'Fehler beim Erstellen des Friseurs' });
      return;
    }
    
    res.status(201).json({
      id: stylistId,
      message: 'Friseur erfolgreich hinzugefügt'
    });
  });
});

// Admin: Service hinzufügen
app.post('/api/salon/:salonId/services', async (req, res) => {
  try {
    const { salonId } = req.params;
    const { name, description, duration, price, category } = req.body;
    
    if (!name || !duration || !price || !category) {
      return res.status(400).json({ error: 'Alle Pflichtfelder müssen ausgefüllt werden' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO services (id, salon_id, name, description, duration, price, category, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const serviceId = uuidv4();
    const now = new Date().toISOString();
    
    stmt.run(serviceId, salonId, name, description, duration, price, category, true, now);
    
    res.status(201).json({
      id: serviceId,
      salon_id: salonId,
      name,
      description,
      duration,
      price,
      category,
      is_active: true,
      created_at: now
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Services:', error);
    res.status(500).json({ error: 'Interner Server-Fehler' });
  }
});

// Admin: Service bearbeiten
app.put('/api/salon/:salonId/services/:serviceId', async (req, res) => {
  try {
    const { salonId, serviceId } = req.params;
    const { name, description, duration, price, category, is_active } = req.body;
    
    if (!name || !duration || !price || !category) {
      return res.status(400).json({ error: 'Alle Pflichtfelder müssen ausgefüllt werden' });
    }
    
    const stmt = db.prepare(`
      UPDATE services 
      SET name = ?, description = ?, duration = ?, price = ?, category = ?, is_active = ?, updated_at = ?
      WHERE id = ? AND salon_id = ?
    `);
    
    const now = new Date().toISOString();
    const result = stmt.run(name, description, duration, price, category, is_active, now, serviceId, salonId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Service nicht gefunden' });
    }
    
    res.json({
      id: serviceId,
      salon_id: salonId,
      name,
      description,
      duration,
      price,
      category,
      is_active,
      updated_at: now
    });
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Services:', error);
    res.status(500).json({ error: 'Interner Server-Fehler' });
  }
});

// Admin: Service löschen (Soft Delete)
app.delete('/api/salon/:salonId/services/:serviceId', async (req, res) => {
  try {
    const { salonId, serviceId } = req.params;
    
    const stmt = db.prepare(`
      UPDATE services 
      SET is_active = false, deleted_at = ?
      WHERE id = ? AND salon_id = ?
    `);
    
    const now = new Date().toISOString();
    const result = stmt.run(false, now, serviceId, salonId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Service nicht gefunden' });
    }
    
    res.json({ message: 'Service erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen des Services:', error);
    res.status(500).json({ error: 'Interner Server-Fehler' });
  }
});

// Hilfsfunktionen
function generateTimeSlots(openTime, closeTime) {
  const slots = [];
  let currentTime = DateTime.fromFormat(openTime, 'HH:mm');
  const closeDateTime = DateTime.fromFormat(closeTime, 'HH:mm');
  
  while (currentTime < closeDateTime) {
    slots.push(currentTime.toFormat('HH:mm'));
    currentTime = currentTime.plus({ minutes: 30 });
  }
  
  return slots;
}

function filterAvailableSlots(slots, appointments, services) {
  // Vereinfachte Implementierung - in der Praxis würde hier eine komplexere Logik stehen
  return slots;
}

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
  console.log(`API verfügbar unter http://localhost:${PORT}/api`);
});

export default app;
