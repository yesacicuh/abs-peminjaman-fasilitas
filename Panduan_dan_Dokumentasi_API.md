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