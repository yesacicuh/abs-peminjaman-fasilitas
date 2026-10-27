# Desain Hak Akses dan Transisi Status Peminjaman

## 1. Aturan Transisi Status
* **Status Awal:** Setiap pengajuan baru secara otomatis berstatus `pending`.
* **Pemrosesan:** Hanya admin yang berhak memproses pengajuan (menyetujui menjadi `approved` atau menolak menjadi `rejected`)[cite: 8].
* **Kondisi Validasi:** Hanya pengajuan dengan status `pending` yang dapat diproses[cite: 8]. 
* **Permanen:** Status akhir (approved/rejected) bersifat final dan tidak dapat diubah lagi[cite: 8].

## 2. Matriks Hak Akses Sistem
Berikut adalah matriks hak akses berdasarkan peran pengguna[cite: 10]:

| Operasi | Mahasiswa | Admin |
| :--- | :--- | :--- |
| **Melihat katalog dan detail fasilitas** | Ya | Ya |
| **Mengajukan peminjaman** | Ya, atas nama sendiri | Tidak |
| **Melihat daftar atau detail pengajuan** | Hanya milik sendiri | Seluruh pengajuan |
| **Menyetujui atau menolak pending** | Tidak | Ya |