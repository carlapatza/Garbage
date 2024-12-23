const express = require('express');
const multer = require('multer'); // Pentru încărcarea fișierelor
const Tesseract = require('tesseract.js'); // Pentru OCR
const path = require('path');
const fs = require('fs'); // Pentru ștergerea fișierelor
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000; // Schimbă portul de la 1337 la 3000

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Pentru procesarea datelor JSON
app.use(express.static('public'));

// Configurare Multer (încărcare fișiere)
const upload = multer({ dest: 'uploads/' });

// Conectare la baza de date SQLite
const db = new sqlite3.Database('./contracte.db', (err) => {
    if (err) {
        console.error('Eroare la conectarea la baza de date:', err.message);
    } else {
        console.log('Conectat la baza de date SQLite.');
    }
});

// Funcție pentru curățarea textului
function cleanText(text) {
    return text.replace(/[=]/g, '').trim();
}

// Rută pentru pagina principală
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rută pentru încărcarea și procesarea imaginilor
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Niciun fișier încărcat.');
    }
    const imagePath = path.join(__dirname, req.file.path);

    try {
        // OCR cu Tesseract.js
        const result = await Tesseract.recognize(imagePath, 'ron', { logger: (info) => console.log(info) });
        const text = result.data.text;
        console.log('Text extras:', text);

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
                console.error('Eroare la inserarea datelor în baza de date:', err.message);
                return res.status(500).send('Eroare la salvarea datelor.');
            }
            console.log('Date salvate în baza de date.');
            res.json({
                id: this.lastID,
                nume: nume,
                prenume: prenume,
                cnp: cnp,
                adresa: adresa
            });
        });

        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Eroare la ștergerea fișierului:', err);
            } else {
                console.log('Fișier încărcat șters:', imagePath);
            }
        });
    } catch (error) {
        console.error('Eroare la procesarea OCR:', error);
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Eroare la ștergerea fișierului:', err);
            }
        });
        res.status(500).send('Eroare la procesarea imaginii.');
    }
});

// Rută pentru obținerea datelor salvate în format JSON
app.get('/api/contracte', (req, res) => {
    const query = 'SELECT * FROM contracte';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Eroare la obținerea datelor din baza de date:', err.message);
            return res.status(500).send('Eroare la obținerea datelor.');
        }
        res.json(rows);
    });
});

// Pornirea serverului
app.listen(port, () => {
    console.log(`Serverul rulează la http://localhost:${port}`);
});

// Închiderea conexiunii la baza de date la închiderea procesului
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Eroare la închiderea bazei de date:', err.message);
        } else {
            console.log('Conexiunea la baza de date închisă.');
        }
        process.exit(0);
    });
});