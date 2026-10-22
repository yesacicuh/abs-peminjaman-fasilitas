require('dotenv').config(); // Memuat variabel dari .env
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const port = 3001;

app.use(express.json());

// --- DATA AWAL ---
// 3 Fasilitas
const facilities = [
    { id: 1, name: "Ruang Rapat A", category: "Ruangan", description: "Kapasitas 20 orang dengan AC", is_active: true },
    { id: 2, name: "Proyektor Epson", category: "Peralatan", description: "Proyektor resolusi 1080p", is_active: true },
    { id: 3, name: "Laboratorium Komputer", category: "Ruangan", description: "Dilengkapi 30 PC Core i7", is_active: false }
];

// 3 Akun (1 Admin, 2 Mahasiswa) dengan password "123456" yang sudah di-hash
const users = [
    { id: 1, username: "admin_yesa", role: "admin", passwordHash: bcrypt.hashSync("123456", 10) },
    { id: 2, username: "mhs_satu", role: "mahasiswa", passwordHash: bcrypt.hashSync("123456", 10) },
    { id: 3, username: "mhs_dua", role: "mahasiswa", passwordHash: bcrypt.hashSync("123456", 10) }
];

// --- ENDPOINT FASILITAS ---
app.get('/', (req, res) => res.send('Layanan Katalog ABS berjalan dengan baik!'));

app.get('/facilities', (req, res) => {
    res.status(200).json(facilities);
});

app.get('/facilities/:id', (req, res) => {
    const facilityId = parseInt(req.params.id);
    const facility = facilities.find(f => f.id === facilityId);
    
    if (facility) {
        res.status(200).json(facility);
    } else {
        res.status(404).json({ message: "Fasilitas tidak ditemukan" });
    }
});

// --- ENDPOINT AUTENTIKASI ---
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // 1. Cari user berdasarkan username
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(401).json({ message: "Kredensial atau token tidak valid" });
    }

    // 2. Verifikasi password dengan bcrypt
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        return res.status(401).json({ message: "Kredensial atau token tidak valid" });
    }

    // 3. Buat token JWT jika berhasil login
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Token berlaku 1 jam
    );

    res.status(200).json({ token });
});

// Menyalakan server
app.listen(port, () => {
    console.log(`Layanan Katalog berjalan di http://localhost:${port}`);
});