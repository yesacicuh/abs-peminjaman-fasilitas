# Panduan Pembuatan Branch Tim ABS (Aplikasi Berorientasi Service)

Dokumen ini berisi panduan untuk melakukan *clone* repositori dan daftar *branch* yang wajib digunakan oleh setiap anggota tim sesuai dengan pembagian tugas.

## Langkah 1: Clone Repositori
Jalankan perintah ini di terminal/Git Bash (hanya dilakukan sekali di awal):
```bash
git clone https://github.com/yesacicuh/abs-peminjaman-fasilitas.git
cd abs-peminjaman-fasilitas
```

## Langkah 2: Pembuatan Branch
**ATURAN PENTING:** Jangan pernah menulis kode langsung di branch `main`. Selalu buat dan pindah ke branch masing-masing sebelum mulai mengerjakan tugas.

Buka terminal di dalam VS Code (tekan `Ctrl` + `` ` ``), lalu jalankan perintah sesuai nama dan tugas kalian di bawah ini:

### 1. Yedida (Anggota 1)
- Fokus: Dokumen Rancangan Awal, Layanan Katalog, Autentikasi.
- **Perintah Branch:**
  * Rancangan Awal: `git checkout -b docs/rancangan-awal`
  * Fitur Katalog: `git checkout -b feat/katalog-service`
  * Fitur Auth (Login): `git checkout -b feat/auth-login`

### 2. Gracia (Anggota 2)
- Fokus: Layanan Peminjaman (Pembuatan pengajuan baru / POST) & Desain Urutan Pengajuan.
- **Perintah Branch:**
  * Desain Urutan Pengajuan: `git checkout -b docs/urutan-pengajuan`
  * Fitur POST Loans: `git checkout -b feat/post-loans`

### 3. Julia (Anggota 3)
- Fokus: Layanan Peminjaman (Daftar, detail, perubahan status) & Desain Matriks/Transisi Status.
- **Perintah Branch:**
  * Desain Hak Akses & Status: `git checkout -b docs/desain-status`
  * Fitur GET & PATCH Loans: `git checkout -b feat/get-patch-loans`

### 4. Mathilda (Anggota 4)
- Fokus: Skrip Klien Terminal, Dokumentasi API, dan Diagram Komponen Arsitektur.
- **Perintah Branch:**
  * Diagram Komponen & Kontrak API: `git checkout -b docs/arsitektur-diagram`
  * Dokumentasi API: `git checkout -b docs/panduan-api`
  * Klien Terminal: `git checkout -b feat/client-script`

## Catatan
- Jika satu tugas sudah selesai dan di-*push*, dan ingin pindah mengerjakan tugas lain, jalankan lagi perintah `git checkout -b <nama-branch-baru>` sesuai daftar di atas.
- Untuk kembali ke branch `main` (misalnya untuk menarik pembaruan terbaru dengan `git pull origin main`), gunakan perintah: `git checkout main`.