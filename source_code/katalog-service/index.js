const express = require('express');
const app = express();
const port = 3001;

// Middleware untuk mem-parsing body berformat JSON
app.use(express.json());

// Data awal 3 fasilitas (sesuai spesifikasi tugas)
const facilities = [
    { id: 1, name: "Ruang Rapat A", category: "Ruangan", description: "Kapasitas 20 orang dengan AC", is_active: true },
    { id: 2, name: "Proyektor Epson", category: "Peralatan", description: "Proyektor resolusi 1080p", is_active: true },
    { id: 3, name: "Laboratorium Komputer", category: "Ruangan", description: "Dilengkapi 30 PC Core i7", is_active: false }
];

// Endpoint dasar untuk memastikan server berjalan
app.get('/', (req, res) => {
    res.send('Layanan Katalog ABS berjalan dengan baik!');
});

// Endpoint 1: Mengambil seluruh daftar fasilitas (GET /facilities)
app.get('/facilities', (req, res) => {
    res.status(200).json(facilities);
});

// Endpoint 2: Mengambil detail fasilitas spesifik (GET /facilities/:id)
app.get('/facilities/:id', (req, res) => {
    const facilityId = parseInt(req.params.id);
    const facility = facilities.find(f => f.id === facilityId);
    
    if (facility) {
        res.status(200).json(facility);
    } else {
        res.status(404).json({ message: "Fasilitas tidak ditemukan" });
    }
});

// Menyalakan server
app.listen(port, () => {
    console.log(`Layanan Katalog berjalan di http://localhost:${port}`);
});