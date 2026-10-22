# Desain Urutan Pengajuan Peminjaman (Layanan Peminjaman)

Pembuatan pengajuan baru (POST `/loans`) melibatkan interaksi antara klien, Layanan Peminjaman, dan Layanan Katalog. Berikut adalah empat langkah utama sistem dalam memproses pengajuan:

### 1. Pemeriksaan Token
- Klien mengirimkan request dengan header `Authorization: Bearer <token>`[cite: 3].
- Middleware Layanan Peminjaman memverifikasi *signature* JWT dan memeriksa waktu kedaluwarsa (`exp`)[cite: 3].
- Sistem mengekstrak identitas pengguna dari *payload* token untuk dijadikan `borrower_id` pada pengajuan[cite: 2]. (Klien tidak dapat memalsukan pemilik pengajuan melalui input body)[cite: 2].

### 2. Pemanggilan Katalog
- Layanan Peminjaman melakukan panggilan HTTP (GET) ke Layanan Katalog untuk memeriksa fasilitas yang diminta[cite: 1].
- Panggilan ini meneruskan token milik pengguna agar Layanan Katalog dapat melakukan verifikasi secara mandiri[cite: 2].
- Tujuan pemanggilan ini adalah memastikan bahwa fasilitas yang diajukan benar-benar ada dan berstatus aktif[cite: 1]. 

### 3. Pemeriksaan Jadwal
- Setelah fasilitas dipastikan aktif, Layanan Peminjaman memeriksa database miliknya sendiri untuk mencari jadwal yang bertumpang tindih (overlap)[cite: 1].
- Sistem memastikan interval `start_at` dan `end_at` tidak bertumpang tindih dengan pengajuan lain yang berstatus `pending` atau `approved` pada fasilitas yang sama[cite: 1]. 
- Interval yang hanya bertemu di batas akhir dan awal (misalnya: pengajuan A selesai pukul 10:00, pengajuan B mulai pukul 10:00) tetap diperbolehkan[cite: 1].
- Jika terdeteksi benturan jadwal, sistem menolak pengajuan (menghasilkan HTTP 409)[cite: 3].

### 4. Penyimpanan Pengajuan
- Jika semua tahap validasi lolos, Layanan Peminjaman menyimpan data pengajuan ke dalam penyimpanannya sendiri (misal: JSON atau SQLite)[cite: 1].
- Status pengajuan baru secara otomatis disetel menjadi `pending`[cite: 1].
- Sistem mengembalikan respons HTTP 201 Created kepada klien sebagai tanda operasi berhasil[cite: 3].