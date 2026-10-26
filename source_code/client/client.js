const axios = require('axios');

// Konfigurasi Base URL kedua layanan
const KATALOG_URL = 'http://localhost:3005/api/v1';
const PEMINJAMAN_URL = 'http://localhost:3002/api/v1';

async function jalankanKlien() {
  console.log('=== MEMULAI SIMULASI KLIEN TERMINAL ===\n');

  try {
    // 1. Login menggunakan akun mahasiswa
    console.log('1. Melakukan login ke Layanan Katalog...');
    const loginRes = await axios.post(`${KATALOG_URL}/auth/login`, {
      username: 'mhs_satu',
      password: '123456'
    });

    const token = loginRes.data.token;
    console.log('Login berhasil! Token JWT diperoleh.\n');

    // Header otentikasi standar
    const headers = { Authorization: `Bearer ${token}` };

    // 2. Membaca daftar fasilitas kampus
    console.log('2. Mengambil daftar fasilitas dari Katalog...');
    const fasilitasRes = await axios.get(`${KATALOG_URL}/facilities`, { headers });
    console.log('Daftar Fasilitas Tersedia:');
    fasilitasRes.data.forEach((f) => {
      console.log(` - [ID ${f.id}] ${f.name} (${f.category}): ${f.description}`);
    });
    console.log('\n');

    // 3. Mengajukan peminjaman fasilitas ke Layanan Peminjaman
    console.log('3. Membuat pengajuan peminjaman fasilitas (ID: 1)...');
    const loanPayload = {
      facility_id: 1,
      start_at: '2026-11-05T09:00:00Z',
      end_at: '2026-11-05T12:00:00Z',
      purpose: 'Kegiatan Praktikum dan Diskusi Mahasiswa'
    };

    const loanRes = await axios.post(`${PEMINJAMAN_URL}/loans`, loanPayload, { headers });
    console.log('Pengajuan berhasil dibuat!');
    console.log(` - ID Peminjaman : ${loanRes.data.id || loanRes.data.data?.id}`);
    console.log(` - Status        : ${loanRes.data.status || loanRes.data.data?.status}\n`);

    // 4. Memeriksa riwayat pengajuan peminjaman milik sendiri
    console.log('4. Mengambil daftar riwayat peminjaman saya...');
    const myLoansRes = await axios.get(`${PEMINJAMAN_URL}/loans`, { headers });
    const loans = Array.isArray(myLoansRes.data) ? myLoansRes.data : myLoansRes.data.data || [];

    console.log('Daftar Riwayat:');
    loans.forEach((l) => {
      console.log(` - ID: ${l.id} | Fasilitas: ${l.facility_id} | Status: ${l.status}`);
    });

    console.log('\n=== SELURUH SKENARIO ALUR PENGGUNA SELESAI DENGAN SUKSES ===');
  } catch (error) {
    console.error('\nTerjadi kesalahan pada alur klien:');
    if (error.response) {
      console.error(`Status HTTP: ${error.response.status}`);
      console.error('Pesan Server:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

jalankanKlien();