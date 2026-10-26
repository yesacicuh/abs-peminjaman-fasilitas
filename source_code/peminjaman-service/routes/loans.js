const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth'); 
const db = require('../db'); 

// POST /api/v1/loans
router.post('/', authenticateToken, async (req, res) => {
    try {
        const borrower_id = req.user.id; 
        const role = req.user.role;

        if (role !== 'mahasiswa') {
            return res.status(403).json({ error: "Hanya mahasiswa yang dapat mengajukan." });
        }

        const { facility_id, start_at, end_at, purpose } = req.body;

        if (!facility_id || !start_at || !end_at || !purpose) {
            return res.status(400).json({ error: "Semua field wajib diisi." });
        }

        const startDate = new Date(start_at);
        const endDate = new Date(end_at);

        if (endDate <= startDate) {
            return res.status(400).json({ error: "Waktu selesai harus setelah waktu mulai." });
        }

        // Panggil Layanan Katalog (Port 3001)
        const authHeader = req.headers.authorization;
        const katalogUrl = process.env.KATALOG_BASE_URL;
        
        const katalogResponse = await fetch(`${katalogUrl}/facilities/${facility_id}`, {
            method: 'GET',
            headers: { 'Authorization': authHeader }
        });

        if (katalogResponse.status === 404) return res.status(404).json({ error: "Fasilitas tidak ditemukan di Katalog." });
        if (!katalogResponse.ok) return res.status(katalogResponse.status).json({ error: "Gagal terhubung ke Layanan Katalog." });

        const facilityData = await katalogResponse.json();
        
        if (!facilityData.is_active) {
            return res.status(409).json({ error: "Fasilitas tidak aktif." });
        }

        // Cek Bentrok Jadwal (Data Array JSON)
        const database = db.read();
        const isOverlap = database.loans.some(loan => {
            const isSameFacility = loan.facility_id === facility_id;
            const isActiveLoan = ['pending', 'approved'].includes(loan.status);
            // Logika overlap: start_baru < end_lama && end_baru > start_lama
            const isTimeOverlap = (startDate < new Date(loan.end_at)) && (endDate > new Date(loan.start_at));
            
            return isSameFacility && isActiveLoan && isTimeOverlap;
        });

        if (isOverlap) {
            return res.status(409).json({ error: "Jadwal bertumpang tindih." });
        }

        // Simpan Pengajuan Baru
        const newId = database.loans.length > 0 ? database.loans[database.loans.length - 1].id + 1 : 1;
        const newLoan = {
            id: newId, facility_id, borrower_id, start_at, end_at, purpose, status: 'pending'
        };

        database.loans.push(newLoan);
        db.write(database);

        return res.status(201).json({ message: "Pengajuan berhasil", data: newLoan });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Kesalahan server internal." });
    }
});

module.exports = router;