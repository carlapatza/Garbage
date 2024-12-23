const sqlite3 = require('sqlite3').verbose();

// Verbindung zur SQLite-Datenbank herstellen
const db = new sqlite3.Database('./contracte.db', (err) => {
    if (err) {
        console.error('Fehler beim Verbinden mit der Datenbank:', err.message);
    } else {
        console.log('Erfolgreich mit der SQLite-Datenbank verbunden.');
    }
});

// Tabelle erstellen, falls sie nicht existiert
db.run(`
    CREATE TABLE IF NOT EXISTS contracte (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        nume TEXT NOT NULL,
        prenume TEXT NOT NULL,
        cnp TEXT NOT NULL,
        adresa TEXT NOT NULL
    )
`, (err) => {
    if (err) {
        console.error('Fehler beim Erstellen der Tabelle:', err.message);
    } else {
        console.log('Tabelle erfolgreich erstellt oder existiert bereits.');
    }
});

// Datenbankverbindung schließen
db.close((err) => {
    if (err) {
        console.error('Fehler beim Schließen der Datenbank:', err.message);
    } else {
        console.log('Datenbankverbindung geschlossen.');
   
    }
});