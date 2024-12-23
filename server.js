const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer'); // Für das Hochladen von Dateien
const Tesseract = require('tesseract.js'); // Für OCR
const path = require('path');
const fs = require('fs'); // Für das Löschen von Dateien
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 1337;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Falls du JSON-Daten verarbeiten möchtest
app.use(express.static('public'));

// Konfiguration für Multer (Datei-Uploads)
const upload = multer({ dest: 'uploads/' });

// Verbindung zur SQLite-Datenbank
const db = new sqlite3.Database('./contracte.db', (err) => {
    if (err) {
        console.error('Fehler beim Verbinden mit der Datenbank:', err.message);
    } else {
        console.log('Erfolgreich mit der SQLite-Datenbank verbunden.');
    }
});

// Funktion zum Bereinigen von Text
function cleanText(text) {
    return text.replace(/[=]/g, '').trim();
}

// Route für die Hauptseite
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route für das Hochladen und Verarbeiten von Bildern
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Keine Datei hochgeladen.');
    }
    const imagePath = path.join(__dirname, req.file.path);

    // OCR mit Tesseract.js
    Tesseract.recognize(
        imagePath,
        'ron',
        {
            logger: (info) => console.log(info)
        }
    )
    .then((result) => {
        const text = result.data.text;
        console.log('Extrahierter Text:', text);

        const lines = text.split('\n').map((line) => line.trim()).filter((line) => line);

        let nume = '';
        let prenume = '';
        let cnp = '';
        let adresa = '';

        lines.forEach((line, index) => {
            if (line.toLowerCase().includes('nume')) {
                nume = cleanText(lines[index + 1] || '');
            }
            if (line.toLowerCase().includes('prenume')) {
                prenume = cleanText(lines[index + 1] || '');
            }
            if (line.toLowerCase().includes('cnp')) {
                cnp = cleanText(lines[index + 1] || '');
            }
            if (line.toLowerCase().includes('adresă') || line.toLowerCase().includes('address')) {
                adresa = cleanText(lines[index + 1] || '');
            }
        });

        const query = `
            INSERT INTO contracte (nume, prenume, cnp, adresa)
            VALUES (?, ?, ?, ?)
        `;
        db.run(query, [nume, prenume, cnp, adresa], function (err) {
            if (err) {
                console.error('Fehler beim Einfügen der Daten in die Datenbank:', err.message);
                res.status(500).send('Fehler beim Speichern der Daten.');
            } else {
                console.log('Daten erfolgreich in der Datenbank gespeichert.');
                res.json({
                    id: this.lastID,
                    nume: nume,
                    prenume: prenume,
                    cnp: cnp,
                    adresa: adresa
                });
            }
        });

        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Fehler beim Löschen der Datei:', err);
            } else {
                console.log('Hochgeladene Datei gelöscht:', imagePath);
            }
        });
    })
    .catch((error) => {
        console.error('Fehler bei der OCR-Verarbeitung:', error);
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Fehler beim Löschen der Datei:', err);
            }
        });
        res.status(500).send('Fehler bei der Verarbeitung des Bildes.');
    });
});

// Route für das Abrufen der gespeicherten Daten
app.get('/contracte', (req, res) => {
    const query = 'SELECT * FROM contracte';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Fehler beim Abrufen der Daten aus der Datenbank:', err.message);
            res.status(500).send('Fehler beim Abrufen der Daten.');
        } else {
            let html = `
                <h1>Gespeicherte Daten</h1>
                <table border="1" cellpadding="5" cellspacing="0">
                    <tr>
                        <th>ID</th>
                        <th>Timestamp</th>
                        <th>Nume</th>
                        <th>Prenume</th>
                        <th>CNP</th>
                        <th>Adresă</th>
                    </tr>
            `;
            rows.forEach((row) => {
                html += `
                    <tr>
                        <td>${row.id}</td>
                        <td>${row.timestamp}</td>
                        <td>${row.nume}</td>
                        <td>${row.prenume}</td>
                        <td>${row.cnp}</td>
                        <td>${row.adresa}</td>
                    </tr>
                `;
            });
            html += '</table>';
            res.send(html);
        }
    });
});

// Server starten
app.listen(port, () => {
    console.log('Server läuft unter http://localhost:' + port);
});

// Datenbankverbindung schließen, wenn der Prozess beendet wird
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Fehler beim Schließen der Datenbank:', err.message);
        } else {
            console.log('Datenbankverbindung geschlossen.');
        }
        process.exit(0);
    });
});