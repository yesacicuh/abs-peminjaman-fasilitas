# Rancangan Arsitektur Sistem Peminjaman Fasilitas

## 1. Pendahuluan dan Kebutuhan Sistem

### Identifikasi Masalah dan Dampaknya
**Masalah:** 
Proses peminjaman fasilitas kampus (seperti ruangan dan peralatan) seringkali belum terintegrasi. Data fasilitas yang tersedia dan jadwal pemakaian tidak dapat dilihat secara *real-time* oleh sivitas akademika, serta proses pengajuannya masih memerlukan konfirmasi manual yang panjang.

**Dampak:** 
Hal ini mengakibatkan inefisiensi waktu bagi peminjam, tingginya risiko bentrokan jadwal penggunaan fasilitas untuk rentang waktu yang tumpang tindih, serta sulitnya pengelola (admin) melacak riwayat dan status permohonan secara transparan.

### Definisi Aktor
Terdapat dua aktor utama yang berinteraksi dengan sistem ini:
1. **Mahasiswa:** Aktor yang bertindak sebagai peminjam (konsumen layanan). Mahasiswa memiliki hak akses untuk melihat daftar dan detail fasilitas di katalog, mengajukan peminjaman fasilitas atas nama dirinya sendiri (berdasarkan identitas pada token), dan hanya dapat melihat daftar serta detail pengajuan miliknya sendiri.
2. **Admin:** Aktor yang bertindak sebagai pengelola fasilitas. Admin memiliki hak akses untuk melihat seluruh fasilitas, melihat seluruh daftar dan detail pengajuan yang masuk dari semua mahasiswa, serta memiliki wewenang penuh untuk memproses (menyetujui atau menolak) pengajuan yang berstatus *pending*.

---

## 2. Tiga Use Case Utama

### Use Case 1: Melihat Fasilitas
Aktor (Mahasiswa atau Admin) ingin melihat daftar fasilitas yang tersedia beserta detailnya (nama, kategori, deskripsi, dan status aktif) sebagai referensi sebelum melakukan peminjaman.

*   **Alur Berhasil:**
    1. Aktor berhasil *login* dan mendapatkan token JWT.
    2. Aktor mengakses menu/endpoint daftar fasilitas.
    3. Sistem memverifikasi token dan meneruskan permintaan ke Layanan Katalog.
    4. Layanan Katalog merespons dengan data daftar fasilitas (HTTP 200 OK).
    5. Aktor memilih salah satu fasilitas, sistem mengembalikan detail fasilitas tersebut dengan benar.
*   **Alur Gagal:**
    1. Aktor mencoba mengakses daftar fasilitas, namun token JWT yang dilampirkan sudah kedaluwarsa (*expired*) atau tidak valid.
    2. Sistem (middleware) gagal memverifikasi token.
    3. Sistem langsung menolak permintaan dengan memberikan respons akses tidak sah (HTTP 401 Unauthorized), dan daftar fasilitas tidak ditampilkan.

### Use Case 2: Mengajukan Peminjaman
Mahasiswa mengajukan peminjaman untuk sebuah fasilitas tertentu dengan menyertakan rentang waktu (waktu mulai dan selesai) serta tujuan kegiatan.

*   **Alur Berhasil:**
    1. Mahasiswa memilih fasilitas yang sedang berstatus aktif.
    2. Mahasiswa memasukkan waktu mulai, waktu selesai (setelah waktu mulai), dan tujuan, lalu mengirim pengajuan.
    3. Layanan Peminjaman menerima permintaan dan memanggil Layanan Katalog untuk memastikan fasilitas benar-benar ada dan aktif.
    4. Sistem memverifikasi jadwal, memastikan tidak ada tumpang tindih (*overlap*) dengan pengajuan lain yang berstatus *pending* atau *approved* pada fasilitas yang sama.
    5. Pengajuan berhasil disimpan dengan status awal *pending* dan ID peminjam (*borrower_id*) diambil langsung dari token (HTTP 201 Created).
*   **Alur Gagal (Bentrok Jadwal):**
    1. Mahasiswa mengirimkan pengajuan peminjaman untuk fasilitas A.
    2. Sistem memeriksa jadwal dan menemukan bahwa rentang waktu yang diajukan bertumpang tindih dengan pengajuan lain yang sudah berstatus *approved* untuk fasilitas A.
    3. Sistem menolak pengajuan tersebut karena benturan jadwal (HTTP 409 Conflict). Data pengajuan baru tidak disimpan ke dalam database.

### Use Case 3: Memproses Pengajuan
Admin meninjau pengajuan peminjaman yang masuk dan memutuskan untuk mengubah statusnya dari *pending* menjadi *approved* (disetujui) atau *rejected* (ditolak).

*   **Alur Berhasil:**
    1. Admin melihat daftar pengajuan dan memilih salah satu pengajuan yang berstatus *pending*.
    2. Admin menekan tombol/mengirim request untuk mengubah status pengajuan tersebut menjadi *approved*.
    3. Sistem memverifikasi token dan memastikan bahwa *role* dari token tersebut adalah Admin.
    4. Sistem Layanan Peminjaman menyimpan perubahan status menjadi *approved* di database.
    5. Sistem mengembalikan respons operasi berhasil (HTTP 200 OK) dan status akhir tidak dapat diubah lagi.
*   **Alur Gagal (Pelanggaran Hak Akses):**
    1. Mahasiswa melihat pengajuannya sendiri yang masih berstatus *pending*.
    2. Mahasiswa mencoba memalsukan proses dengan mengirim request (PATCH) langsung ke API untuk menyetujui pengajuannya sendiri menjadi *approved*.
    3. Sistem mengekstrak peran (*role*) dari token JWT dan mendeteksi bahwa aktor tersebut adalah Mahasiswa, bukan Admin.
    4. Sistem memblokir operasi tersebut karena akses terlarang (HTTP 403 Forbidden). Status pengajuan tetap tidak berubah.