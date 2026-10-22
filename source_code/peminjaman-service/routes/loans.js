const express = require('express');
const router = express.Router();
// Asumsi Yedida menyiapkan middleware auth dan file koneksi db
const { authenticateToken } = require('../middlewares/auth'); 
const db = require('../db'); 

// POST /api/v1/loans
router.post('/', authenticateToken, async (req, res) => {
    try {
        // Ambil borrower_id dari token, bukan dari body
        const borrower_id = req.user.id; 
        const role = req.user.role;

        if (role !== 'mahasiswa') {
            return res.status(403).json({ error: "Hanya mahasiswa yang dapat mengajukan peminjaman." });
        }

        const { facility_id, start_at, end_at, purpose } = req.body;

        if (!facility_id || !start_at || !end_at || !purpose) {
            return res.status(400).json({ error: "Semua field wajib diisi." });
        }

        if (new Date(end_at) <= new Date(start_at)) {
            return res.status(400).json({ error: "Waktu selesai harus setelah waktu mulai." });
        }

        // Panggil Layanan Katalog dengan meneruskan token
        const authHeader = req.headers.authorization;
        const katalogUrl = process.env.KATALOG_BASE_URL || 'http://localhost:3001/api/v1';
        
        const katalogResponse = await fetch(`${katalogUrl}/facilities/${facility_id}`, {
            method: 'GET',
            headers: { 'Authorization': authHeader }
        });

        if (katalogResponse.status === 404) return res.status(404).json({ error: "Fasilitas tidak ditemukan." });
        if (!katalogResponse.ok) return res.status(katalogResponse.status).json({ error: "Gagal memverifikasi fasilitas." });

        const facilityData = await katalogResponse.json();
        if (!facilityData.is_active) return res.status(409).json({ error: "Fasilitas tidak aktif." });

        // Cek bentrok jadwal (overlap)
        const overlapQuery = `
            SELECT id FROM loans 
            WHERE facility_id = ? AND status IN ('pending', 'approved')
            AND start_at < ? AND end_at > ?
        `;
        const existingOverlap = db.prepare(overlapQuery).get(facility_id, end_at, start_at);

        if (existingOverlap) {
            return res.status(409).json({ error: "Jadwal bertumpang tindih." });
        }

        // Simpan pengajuan
        const insertQuery = `
            INSERT INTO loans (facility_id, borrower_id, start_at, end_at, purpose, status) 
            VALUES (?, ?, ?, ?, ?, 'pending')
        `;
        const result = db.prepare(insertQuery).run(facility_id, borrower_id, start_at, end_at, purpose);

        return res.status(201).json({
            message: "Pengajuan berhasil",
            data: { id: result.lastInsertRowid, facility_id, borrower_id, start_at, end_at, purpose, status: 'pending' }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Terjadi kesalahan server." });
    }
});

module.exports = router;