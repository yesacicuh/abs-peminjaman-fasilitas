# Panduan Menjalankan dan Dokumentasi REST API
Sistem Peminjaman Fasilitas Kampus Terintegrasi

Dokumen ini merupakan panduan teknis resmi pengoperasian sistem peminjaman fasilitas berbasis REST API, konfigurasi lingkungan (*environment*), akun uji, format payload seragam, serta spesifikasi teknis 7 endpoint minimum.

---

## 1. Prasyarat dan Instalasi

### Prasyarat Sistem
* Node.js versi 18.x LTS atau lebih baru
* NPM versi 9.x atau lebih baru
* Git

### Langkah Instalasi Dependensi
Jalankan instalasi modul dependensi pada masing-masing folder layanan:
```bash
# 1. Masuk dan install dependensi Layanan Katalog & Auth
cd source_code/katalog-service
npm install

# 2. Pindah dan install dependensi Layanan Peminjaman
cd ../peminjaman-service
npm install

# 3. Pindah dan install dependensi Skrip Klien
cd ../client
npm install

# 4. Kembali ke root repositori
cd ../..

---

## 2. Konfigurasi Lingkungan (.env) dan Port

Layanan berjalan sebagai dua proses domain terpisah pada port yang berbeda dan memiliki basis data mandiri.

### A. Konfigurasi Layanan Katalog (source_code/katalog-service/.env)
Buat berkas .env di dalam folder source_code/katalog-service/:
PORT=3005
JWT_SECRET=

### B. Konfigurasi Layanan Peminjaman (source_code/peminjaman-service/.env)
Buat berkas .env di dalam folder source_code/peminjaman-service/:
PORT=3002
JWT_SECRET=
KATALOG_BASE_URL=http://localhost:3005/api/v1

---

## 3. Akun Uji dan Inisialisasi Data Awal (Seed Data)

### Daftar Akun Uji Bawaan
Tersedia 3 akun uji dengan kata sandi ter-hash:

| Username | Password | Role | Keterangan Pengujian |
| :--- | :--- | :--- | :--- |
| admin_yesa | 123456 | admin | Pengelola fasilitas, akses seluruh riwayat pengajuan, persetujuan/penolakan permohonan |
| mhs1 | 123456 | mahasiswa | Mahasiswa A, membuat pengajuan peminjaman dan melihat riwayat miliknya |
| mhs2 | 123456 | mahasiswa | Mahasiswa B, pengujian isolasi hak akses kepemilikan antar-mahasiswa |

### Skrip Inisialisasi dan Reset Data
Sebelum pengujian dijalankan, isi basis data awal dengan data bawaan (3 fasilitas dan 3 akun):

# Inisialisasi basis data Katalog (users & facilities)
cd source_code/katalog-service
npm run seed

# Inisialisasi basis data Peminjaman (tabel loans kosong / data awal)
cd ../peminjaman-service
npm run seed
cd ../..

---

## 4. Cara Menjalankan Layanan dan Skrip Klien

Buka tiga jendela terminal terpisah:

* Terminal 1 (Layanan Katalog & Auth - Port 3005):
  cd source_code/katalog-service
  npm start

* Terminal 2 (Layanan Peminjaman - Port 3002):
  cd source_code/peminjaman-service
  npm start

* Terminal 3 (Eksekusi Skrip Klien Terminal):
  cd source_code/client
  node client.js

---

## 5. Standar Format Komunikasi API

* Base URL Katalog: http://localhost:3005/api/v1
* Base URL Peminjaman: http://localhost:3002/api/v1
* Header Permintaan Standar:
  * Content-Type: application/json
  * Accept: application/json
  * Authorization: Bearer <token_jwt> (wajib pada endpoint terproteksi)

### Format Respons Seragam
* Respons Berhasil (200 OK / 201 Created):
{
  "success": true,
  "data": {}
}

* Respons Kesalahan (4xx / 5xx):
{
  "success": false,
  "error": {
    "code": "KODE_ERROR",
    "message": "Deskripsi penyebab kesalahan"
  }
}

---

## 6. Tabel Kontrak Spesifikasi 7 Endpoint Minimum

| No | Layanan Pemilik | Method | Path | Parameter / Body | Hak Akses | Status Sukses | Status Error |
| :-: | :--- | :--- | :--- | :--- | :--- | :-: | :-: |
| 1 | Katalog | POST | /auth/login | username (string, wajib), password (string, wajib) | Publik | 200 OK | 400, 401 |
| 2 | Katalog | GET | /facilities | Opsional query: category, page, limit | Mahasiswa, Admin | 200 OK | 401 |
| 3 | Katalog | GET | /facilities/{id} | Path param: id (integer, wajib) | Mahasiswa, Admin | 200 OK | 401, 404 |
| 4 | Peminjaman | POST | /loans | facility_id (int), start_at (ISO 8601), end_at (ISO 8601), purpose (string). borrower_id dari token. | Mahasiswa | 201 Created | 400, 401, 403, 404, 409 |
| 5 | Peminjaman | GET | /loans | Opsional query: status, page, limit | Mahasiswa (milik sendiri), Admin (semua) | 200 OK | 401 |
| 6 | Peminjaman | GET | /loans/{id} | Path param: id (integer, wajib) | Pemilik Pengajuan atau Admin | 200 OK | 401, 403, 404 |
| 7 | Peminjaman | PATCH | /loans/{id} | status (string: "approved" / "rejected", wajib) | Admin | 200 OK | 400, 401, 403, 404, 409 |

---

## 7. Rincian Teknis Endpoint dan Contoh Request-Response

### 1. Autentikasi Pengguna: POST /api/v1/auth/login
Memverifikasi kredensial username dan password di server, kemudian menerbitkan token JWT.

* Request:
POST /api/v1/auth/login HTTP/1.1
Host: localhost:3005
Content-Type: application/json

{
  "username": "mhs1",
  "password": "123456"
}

* Response Berhasil (200 OK):
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "username": "mhs1",
      "role": "mahasiswa"
    }
  }
}

* Response Gagal - Kredensial Tidak Valid (401 Unauthorized):
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Kredensial atau token tidak valid"
  }
}

---

### 2. Membaca Daftar Fasilitas: GET /api/v1/facilities
Menampilkan katalog fasilitas kampus yang aktif.

* Request:
GET /api/v1/facilities HTTP/1.1
Host: localhost:3005
Authorization: Bearer <token_jwt>

* Response Berhasil (200 OK):
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Ruang Seminar Utama",
      "category": "Ruangan",
      "description": "Kapasitas 100 orang, proyektor, AC",
      "is_active": true
    },
    {
      "id": 2,
      "name": "Proyektor Portabel A",
      "category": "Peralatan",
      "description": "Proyektor HDMI 3000 ANSI Lumens",
      "is_active": true
    }
  ]
}

* Response Gagal - Tanpa Token (401 Unauthorized):
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token tidak valid atau kedaluwarsa."
  }
}

---

### 3. Membaca Detail Fasilitas: GET /api/v1/facilities/{id}
Menampilkan detail lengkap satu item fasilitas.

* Request:
GET /api/v1/facilities/1 HTTP/1.1
Host: localhost:3005
Authorization: Bearer <token_jwt>

* Response Berhasil (200 OK):
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ruang Seminar Utama",
    "category": "Ruangan",
    "description": "Kapasitas 100 orang, proyektor, AC",
    "is_active": true
  }
}

* Response Gagal - ID Fasilitas Tidak Ada (404 Not Found):
{
  "success": false,
  "error": {
    "code": "FACILITY_NOT_FOUND",
    "message": "Fasilitas dengan ID yang diminta tidak ditemukan"
  }
}

---

### 4. Membuat Pengajuan Peminjaman: POST /api/v1/loans
Mahasiswa mengajukan permohonan peminjaman fasilitas. Layanan Peminjaman akan memvalidasi fasilitas ke Layanan Katalog dan memeriksa ada tidaknya benturan jadwal. Nilai borrower_id diambil dari token JWT, bukan dari request body.

* Request:
POST /api/v1/loans HTTP/1.1
Host: localhost:3002
Authorization: Bearer <token_jwt_mahasiswa>
Content-Type: application/json

{
  "facility_id": 1,
  "start_at": "2026-11-01T08:00:00Z",
  "end_at": "2026-11-01T12:00:00Z",
  "purpose": "Kegiatan Workshop Web Service"
}

* Response Berhasil (201 Created):
{
  "success": true,
  "data": {
    "id": 101,
    "facility_id": 1,
    "borrower_id": 2,
    "start_at": "2026-11-01T08:00:00Z",
    "end_at": "2026-11-01T12:00:00Z",
    "purpose": "Kegiatan Workshop Web Service",
    "status": "pending"
  }
}

* Response Gagal - Waktu Tidak Valid (400 Bad Request):
{
  "success": false,
  "error": {
    "code": "INVALID_TIME_RANGE",
    "message": "waktu selesai harus setelah waktu mulai"
  }
}

* Response Gagal - Bentrok Jadwal / Fasilitas Nonaktif (409 Conflict):
{
  "success": false,
  "error": {
    "code": "SCHEDULE_CONFLICT",
    "message": "Jadwal bertumpang tindih"
  }
}

---

### 5. Membaca Daftar Pengajuan: GET /api/v1/loans
Melihat daftar peminjaman. Mahasiswa hanya mendapatkan permohonan miliknya sendiri, sedangkan Admin menerima seluruh daftar pengajuan.

* Request:
GET /api/v1/loans HTTP/1.1
Host: localhost:3002
Authorization: Bearer <token_jwt>

* Response Berhasil (200 OK):
{
  "success": true,
  "data": [
    {
      "id": 101,
      "facility_id": 1,
      "borrower_id": 2,
      "start_at": "2026-11-01T08:00:00Z",
      "end_at": "2026-11-01T12:00:00Z",
      "purpose": "Kegiatan Workshop Web Service",
      "status": "pending"
    }
  ]
}

---

### 6. Membaca Detail Pengajuan: GET /api/v1/loans/{id}
Melihat rincian satu permohonan. Hanya diizinkan bagi pemilik pengajuan atau Admin.

* Request:
GET /api/v1/loans/101 HTTP/1.1
Host: localhost:3002
Authorization: Bearer <token_jwt>

* Response Gagal - Pelanggaran Kepemilikan (403 Forbidden):
{
  "success": false,
  "error": {
    "code": "FORBIDDEN_RESOURCE",
    "message": "Akses terlarang. Anda bukan pemilik pengajuan ini."
  }
}

---

### 7. Memproses Status Pengajuan: PATCH /api/v1/loans/{id}
Admin menyetujui (approved) atau menolak (rejected) pengajuan yang berstatus pending.

* Request (Admin):
PATCH /api/v1/loans/101 HTTP/1.1
Host: localhost:3002
Authorization: Bearer <token_jwt_admin>
Content-Type: application/json

{
  "status": "approved"
}

* Response Berhasil (200 OK):
{
  "success": true,
  "data": {
    "id": 101,
    "facility_id": 1,
    "borrower_id": 2,
    "status": "approved"
  }
}

* Response Gagal - Bukan Admin (403 Forbidden):
{
  "success": false,
  "error": {
    "code": "FORBIDDEN_ROLE",
    "message": "Akses terlarang. Hanya admin yang dapat memproses pengajuan"
  }
}

* Response Gagal - Status Akhir Tidak Dapat Diubah (409 Conflict):
{
  "success": false,
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Transisi tidak sah. Pengajuan sudah diproses sebelumnya."
  }
}